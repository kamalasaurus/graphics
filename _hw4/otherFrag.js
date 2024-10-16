export default function _fragmentShader() {
    return `
    // uniform float uTime, uFL;
    // uniform vec3 uCursor;
    // varying vec3 vPos;
    // uniform vec3 uL;
    // uniform mat4 uA[${NQ}], uB[${NQ}], uC[${NQ}];

// Fragment shader source
precision mediump float;
uniform mat4 u_quadricCylinder; // Cylinder quadric
uniform mat4 u_quadricSlab;     // Slab quadric
uniform vec3 u_cameraPosition;
uniform vec3 u_cameraTarget;
uniform float u_fov;
uniform float u_aspectRatio;
varying vec3 vPos;

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

    // Intersect the ray with the cylinder quadric
    float tCylinder = intersectQuadric(u_quadricCylinder, u_cameraPosition, rayDir);
    
    // Intersect the ray with the slab quadric
    float tSlab = intersectQuadric(u_quadricSlab, u_cameraPosition, rayDir);

    // Ensure the cylinder intersection point is within the slab's bounds
    bool inSlab = false;
    if (tCylinder > 0.0) {
        // Compute the intersection point with the cylinder
        vec3 intersection = u_cameraPosition + tCylinder * rayDir;
        // Check if the x-coordinate of the intersection lies within the slab's range
        float slabValue = dot(vec4(intersection, 1.0), u_quadricSlab * vec4(intersection, 1.0));
        if (slabValue <= 0.0) {
            inSlab = true;
        }
    }

    // If the cylinder intersection is not within the slab, consider it invalid
    if (!inSlab) {
        tCylinder = -1.0;
    }

    // Find the closest positive intersection
    float tMin = -1.0;
    if (tCylinder > 0.0) tMin = tCylinder;
    if (tSlab > 0.0 && (tMin < 0.0 || tSlab < tMin)) tMin = tSlab;

    // If no valid intersection, set the background color
    if (tMin < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Compute the intersection point
    vec3 intersection = u_cameraPosition + tMin * rayDir;

    // Determine which quadric was intersected and calculate the normal
    vec3 normal;
    if (tMin == tCylinder) {
        normal = normalize((u_quadricCylinder * vec4(intersection, 1.0)).xyz);
    } else {
        normal = normalize((u_quadricSlab * vec4(intersection, 1.0)).xyz);
    }

    // Simple diffuse lighting model
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Set the fragment color based on the diffuse lighting
    gl_FragColor = vec4(vec3(diffuse), 1.0);
}
    `
}