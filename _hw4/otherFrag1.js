export default function _fragmentShader(NQ) {
    return `
    precision mediump float;
    uniform float uTime, uFL;
    uniform vec3 uCursor;
    varying vec3 vPos;
    uniform vec3 uL;
    uniform mat4 uA[${NQ}], uB[${NQ}], uC[${NQ}];

    // uniform vec3 uMaterials[4]; // Array of material colors
    // uniform vec3 uHighlights[4]; // Array of highlight colors
    // uniform float uPowers[4]; // Array of power values

    float intersectQuadric(float a, float b, float c, float d, float e, float f, float g, float h, float i, float j, vec3 V, vec3 W) {
        float VW = dot(V, W); // Compute the dot product of V with the ray direction W (V.W)
        float VV = dot(V, V); // Compute the dot product of V with itself (V.V)
        float r = sqrt(a * a + b * b + c * c); // Compute the radius (example calculation, adjust as needed)
        float discriminant = VW * VW - (VV - r * r); // Compute the discriminant
        if (discriminant > 0.0) {
            return -VW - sqrt(discriminant); // Return the distance to the intersection point
        }
        return -1.0; // No intersection
    }

    void main() {
        vec3 color = vec3(0.);
        vec3 N = normalize(vPos);
        vec3 L = normalize(uL);
        vec3 V = normalize(-vPos);
        vec3 R = reflect(-L, N);

        float tMin = 1e20; // Initialize tMin to a large value

        for (int idx = 0; idx < ${NQ}; idx++) {
            mat4 Q = uA[idx];

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

            float tA = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, R);
            if (tA > 0.0 && tA < tMin) {
                tMin = tA;
            }

            // Q = uB[idx];
            // a = Q[0][0];
            // b = Q[1][1];
            // c = Q[2][2];
            // d = Q[1][2];
            // e = Q[2][0];
            // f = Q[0][1];
            // g = Q[0][2];
            // h = Q[1][0];
            // i = Q[2][1];
            // j = Q[3][3];

            // float tB = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, R);
            // if (tB > 0.0 && tB < tMin) {
            //     tMin = tB;
            // }

            // Q = uC[idx];
            // a = Q[0][0];
            // b = Q[1][1];
            // c = Q[2][2];
            // d = Q[1][2];
            // e = Q[2][0];
            // f = Q[0][1];
            // g = Q[0][2];
            // h = Q[1][0];
            // i = Q[2][1];
            // j = Q[3][3];

            // float tC = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, R);
            // if (tC > 0.0 && tC < tMin) {
            //     tMin = tC;
            // }
            
            if (tMin < 1e20) {
                // vec3 P = vPos + tMin * V;
                vec3 P = V + tMin * R;

                // Compute the normal at P for a generic quadric
                vec3 N = normalize(vec3(
                    2.0 * a * P.x + e * P.z + f * P.y + g,
                    2.0 * b * P.y + d * P.z + f * P.x + h,
                    2.0 * c * P.z + d * P.y + e * P.x + i
                ));

                // color = 0.2 * uMaterials[0];
                color = 0.2 * vec3(1.0, 0.0, 0.0);
                color += vec3(0.1 + max(0.0, dot(N, vec3(0.5))));
                color += vec3(1.0, 0.0, 0.0);
            }
        }

        gl_FragColor = vec4(sqrt(color), 1.0);
    }  
    `
}