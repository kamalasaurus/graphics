export default function _fragmentShader() {
    return `
precision mediump float;
uniform mat4 u_quadricCylinder; // Cylinder quadric
uniform mat4 u_quadricSlab;     // Slab quadric
uniform mat4 u_quadricEverywhere; // Everywhere quadric
uniform vec3 u_cameraPosition;
uniform vec3 u_cameraTarget;
uniform float u_fov;
uniform float u_aspectRatio;
uniform float u_time; // Current time
varying vec3 vPos;

// Function to transpose a 4x4 matrix
mat4 transpose(mat4 m) {
    return mat4(
        m[0][0], m[1][0], m[2][0], m[3][0],
        m[0][1], m[1][1], m[2][1], m[3][1],
        m[0][2], m[1][2], m[2][2], m[3][2],
        m[0][3], m[1][3], m[2][3], m[3][3]
    );
}

// Function to create a rotation matrix for the X axis
mat4 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, c, -s, 0.0,
                0.0, s, c, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

// Function to create a rotation matrix for the Y axis
mat4 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(c, 0.0, s, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -s, 0.0, c, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

// Function to create a rotation matrix for the Z axis
mat4 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(c, -s, 0.0, 0.0,
                s, c, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

// Function to create a properly composed rotation matrix
mat4 composeRotation(float time) {
    // Rotate around X, then Y, and finally Z to maintain the correct transformation order
    mat4 rotX = rotateX(time * 0.5);
    mat4 rotY = rotateY(time);
    mat4 rotZ = rotateZ(time * 0.3);
    // Compose the rotations: Z first, then Y, then X
    return rotX * rotY * rotZ;
}

// Function to solve the quadratic equation
float solveQuadratic(float a, float b, float c) {
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return -1.0;
    float sqrtDiscriminant = sqrt(discriminant);
    float t1 = (-b - sqrtDiscriminant) / (2.0 * a);
    float t2 = (-b + sqrtDiscriminant) / (2.0 * a);
    if (t1 > 0.0 && t2 > 0.0) return min(t1, t2);
    else if (t1 > 0.0) return t1;
    else if (t2 > 0.0) return t2;
    return -1.0;
}

// Function to calculate the intersection with a quadric
float intersectQuadric(mat4 quadric, vec3 rayOrigin, vec3 rayDir) {
    vec4 origin = vec4(rayOrigin, 1.0);
    vec4 direction = vec4(rayDir, 0.0);
    float a = dot(direction, quadric * direction);
    float b = 2.0 * dot(origin, quadric * direction);
    float c = dot(origin, quadric * origin);
    return solveQuadratic(a, b, c);
}

void main() {
    // Calculate ray direction
    vec3 forward = normalize(u_cameraTarget - u_cameraPosition);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    float aspect = u_aspectRatio;
    float fovScale = tan(radians(u_fov) / 2.0);
    vec3 rayDir = normalize(forward + (vPos.x * 2.0 - 1.0) * fovScale * right * aspect + (vPos.y * 2.0 - 1.0) * fovScale * up);

    // Create a composed rotation matrix based on time
    mat4 rotation = composeRotation(u_time);
    
    // Apply the rotation to the cylinder quadric
    mat4 rotatedQuadricCylinder = transpose(rotation) * u_quadricCylinder * rotation;

    // Intersect the ray with the rotated cylinder quadric
    float tCylinder = intersectQuadric(rotatedQuadricCylinder, u_cameraPosition, rayDir);
    
    // If no intersection with the cylinder, set tMin to an invalid value
    if (tCylinder < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Uniform black background
        return;
    }

    // Compute the intersection point with the cylinder
    vec3 intersection = u_cameraPosition + tCylinder * rayDir;

    // Check if the intersection is within the slab bounds
    float slabValue = dot(vec4(intersection, 1.0), u_quadricSlab * vec4(intersection, 1.0));
    if (slabValue > 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Uniform black background
        return;
    }

    // Check if the intersection satisfies the everywhere condition
    float everywhereValue = dot(vec4(intersection, 1.0), u_quadricEverywhere * vec4(intersection, 1.0));
    if (everywhereValue > 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Uniform black background
        return;
    }

    // Calculate the normal at the intersection
    vec3 normal = normalize((rotatedQuadricCylinder * vec4(intersection, 1.0)).xyz);

    // Simple diffuse lighting model
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Set the fragment color based on the diffuse lighting
    gl_FragColor = vec4(vec3(diffuse), 1.0);
}
    `
}