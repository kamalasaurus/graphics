export default function _fragmentShader(NQ) {
    return `
precision mediump float;

uniform float uTime, uFL;
uniform vec3 uCursor;
uniform vec3 uL[2];
uniform mat4 uA[${NQ}], uB[${NQ}], uC[${NQ}];
varying vec3 vPos;

uniform vec3 uMaterials[4]; // Array of material colors
uniform vec3 uHighlights[4]; // Array of highlight colors
uniform float uPowers[4]; // Array of power values

vec2 solveQuadratic(float a, float b, float c) {
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return vec2(-1.0, -1.0);
    float sqrtDiscriminant = sqrt(discriminant);
    float t1 = (-b - sqrtDiscriminant) / (2.0 * a);
    float t2 = (-b + sqrtDiscriminant) / (2.0 * a);
    return vec2(min(t1, t2), max(t1, t2));
}

vec2 intersectQuadric(mat4 quadric, vec3 rayOrigin, vec3 rayDir) {
    vec4 origin = vec4(rayOrigin, 1.0);
    vec4 direction = vec4(rayDir, 0.0);

    float a = quadric[0][0];
    float b = quadric[1][1];
    float c = quadric[2][2];
    float d = quadric[1][2] + quadric[2][1];
    float e = quadric[2][0] + quadric[0][2];
    float f = quadric[0][1] + quadric[1][0];
    float g = quadric[0][3] + quadric[3][0];
    float h = quadric[1][3] + quadric[3][1];
    float i = quadric[2][3] + quadric[3][2];
    float j = quadric[3][3];

    float A = a * direction.x * direction.x + b * direction.y * direction.y + c * direction.z * direction.z +
              d * direction.y * direction.z + e * direction.z * direction.x + f * direction.x * direction.y;
    float B = 2.0 * (a * origin.x * direction.x + b * origin.y * direction.y + c * origin.z * direction.z) +
              d * (origin.y * direction.z + origin.z * direction.y) +
              e * (origin.z * direction.x + origin.x * direction.z) +
              f * (origin.x * direction.y + origin.y * direction.x) +
              g * direction.x + h * direction.y + i * direction.z;
    float C = a * origin.x * origin.x + b * origin.y * origin.y + c * origin.z * origin.z +
              d * origin.y * origin.z + e * origin.z * origin.x + f * origin.x * origin.y +
              g * origin.x + h * origin.y + i * origin.z + j;

    return solveQuadratic(A, B, C);
}

void main() {
    vec3 bgColor = vec3(0.2, 0.8, 0.75);

    vec3 color = bgColor;
    vec3 V = vec3(0., 0., 0.);  // Ray origin
    vec3 W = normalize(vec3(vPos.xy,-uFL));  // Ray Direction
    vec3 L1 = normalize(uL[0]);  // Light direction
    vec3 L2 = normalize(uL[1]); // Light direction

    vec3 material = uMaterials[0];
    vec3 highlight = uHighlights[0];
    float power = uPowers[0];

    float tMin = 1000.;
    float tMax = -1000.;

    mat4 Q = mat4(0.0);

    for (int idx = 0; idx < ${NQ}; idx++) {
        float tIn = -1000.0;
        float tOut = 1000.0;

        for (int j = 0; j < 3; j++) {
            mat4 currentQ = (j == 0) ? uA[idx] : ((j == 1) ? uB[idx] : uC[idx]);
            vec2 ts = intersectQuadric(currentQ, V, W);

            // Update tIn and tOut
            tIn = max(tIn, ts.x);
            tOut = min(tOut, ts.y);
        }

        if (tIn < tOut && tIn > 0.0) {
            if (tIn < tMin) {
                tMin = tIn;
                Q = (tIn == intersectQuadric(uA[idx], V, W).x) ? uA[idx] :
                    (tIn == intersectQuadric(uB[idx], V, W).x) ? uB[idx] : uC[idx];
            }
            tMax = max(tMax, tOut);
        }

        float a = Q[0][0];
        float b = Q[1][1];
        float c = Q[2][2];
        float d = Q[1][2];
        float e = Q[2][0];
        float f = Q[0][1];
        float g = Q[0][2];
        float h = Q[1][0];
        float i = Q[2][1];
        float j = Q[3][3];

        if (tMin > 0.0 && tMin < 1000.) {
            vec3 P = V + tMin * W;

            vec3 N = normalize(vec3(2.*a*P.x + e*P.z + f*P.y + g,
                            2.*b*P.y + d*P.z + f*P.x + h,
                            2.*c*P.z + d*P.y + e*P.x + i ) );

            vec3 R = reflect(-L1, N);

            color = .2 * material;
            float diffuse = max(dot(N, L2), max(dot(N, L1), 0.0));
            color += vec3(.1 + diffuse);
        }
    }

    gl_FragColor = vec4(sqrt(color), 1.0);
}
    `
}