export default function _fragmentShader(NQ) {
    return `
precision highp float;

uniform float uTime, uFL;
uniform vec3 uCursor;
uniform vec3 uL[2];
uniform mat4 uA[${NQ}], uB[${NQ}], uC[${NQ}];
varying vec3 vPos;

uniform vec3 uMaterials[${NQ}];
uniform vec3 uHighlights[${NQ}];
uniform float uPowers[${NQ}];

float noise(vec3 point) { float r = 0.; for (int i=0;i<16;i++) {
    vec3 D, p = point + mod(vec3(i,i/4,i/8) , vec3(4.0,2.0,2.0)) +
        1.7*sin(vec3(i,5*i,8*i)), C=floor(p), P=p-C-.5, A=abs(P);
    C += mod(C.x+C.y+C.z,2.) * step(max(A.yzx,A.zxy),A) * sign(P);
    D=34.*sin(987.*float(i)+876.*C+76.*C.yzx+765.*C.zxy);P=p-C-.5;
    r+=sin(6.3*dot(P,fract(D)-.5))*pow(max(0.,1.-2.*dot(P,P)),4.);
} return .5 * sin(r); }

float turbulence(vec3 P) {
    float f = 0., s = 1.;
    for (int i = 0 ; i < 9 ; i++) {
        f += abs(noise(s * P)) / s;
        s *= 2.;
        P = vec3(.866*P.x + .5*P.z, P.y + 100., -.5*P.x + .866*P.z);
    }
    return f;
}        

float turbulence2(vec3 P) {
    float f = 0., s = 1.;
    for (int i = 0 ; i < 6 ; i++) {
        f += abs(noise(s * P)) / s;
        s *= 2.;
        P = vec3(.866*P.x + .5*P.z, P.y + 100., -.5*P.x + .866*P.z);
    }
    return f;
}   

vec3 marble(vec3 pos) {
    float v = turbulence(pos);
    float s = sqrt(.5 + .5 * sin(20. * pos.y + 8. * v));
    return vec3(.8,.7,.5) * vec3(s,s*s,s*s*s);
}

vec2 quadraticRoots(float a, float b, float c) {
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

    return quadraticRoots(A, B, C);
}

vec3 cloudify(vec3 color, vec3 pos) {
    float y = .1 * pos.y - .02;
    y += turbulence(.5 * pos + vec3(.03*uTime,0.,.03*uTime));
    color = mix(color, (vec3(.5) * color), y<0.? 0. : y>.1 ? 1. : y/.1);
    color = mix(color, vec3(1.7), y<.1 ? 0. : y-.1);
    return color;
}

vec3 cloudify2(vec3 color, vec3 pos) {
    float y = .1 * pos.y + .25;
    y += turbulence2(.1 * pos + vec3(0.,.3*uTime,0.));
    color = mix(color, (vec3(.5) * color), y< 0. ? 0. : y>.1 ? 1. : y/.1);
    color = mix(color, vec3(1.7), y< .1 ? 0. : y-.1);
    return color;
}

void main() {
    vec3 bgColor = vec3(0.7, 0.7, 1.0);
    bgColor = mix(bgColor, vec3(0.3, 0.1, 0.3), vPos.y);
    
    vec3 color = bgColor;
    vec3 V = vec3(0., 0., 0.);  // Ray origin
    vec3 W = normalize(vec3(vPos.xy,-uFL));  // Ray Direction
    vec3 L1 = normalize(uL[0]);  // Light direction
    vec3 L2 = normalize(uL[1]); // Light direction

    float tMin = 1000.;
    float tMax = -1000.;

    mat4 Q = mat4(0.0);
    vec3 material = vec3(0.0);
    vec3 highlight = vec3(0.0);
    float power = 0.0;

    int isPlane = 0;

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

                isPlane = idx;
                material = uMaterials[idx];
                highlight = uHighlights[idx];
                power = uPowers[idx];
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


            vec3 d = material * max(dot(N,L2), max(0., dot(N,L1)));
            vec3 R = W - 2. * N * dot(N, W);
            vec3 s = highlight * pow(max(0., dot(R, L1)), power);

            // this feels very recursive but it doesn't seem like we can recurse in GLSL
            vec3 reflectedColor = vec3(0.0);

            float tMinReflected = 1000.0;
            float tMaxReflected = -1000.0;

            mat4 QReflected = mat4(0.0);
            vec3 materialReflected = vec3(0.0);
            vec3 highlightReflected = vec3(0.0);
            float powerReflected = 0.0;

            int isPlaneReflected = 0;

            for (int idxR = 0; idxR < ${NQ}; idxR++) {
                float tInReflected = -1000.0;
                float tOutReflected = 1000.0;

                for (int j = 0; j < 3; j++) {
                    mat4 currentQ = (j == 0) ? uA[idxR] : ((j == 1) ? uB[idxR] : uC[idxR]);
                    vec2 ts = intersectQuadric(currentQ, V, W);

                    // Update tIn and tOut
                    tInReflected = max(tInReflected, ts.x);
                    tOutReflected = min(tOutReflected, ts.y);
                }

                if (tInReflected < tOutReflected && tInReflected > 0.0) {
                    if (tInReflected < tMinReflected) {
                        tMinReflected = tInReflected;
                        QReflected = (tInReflected == intersectQuadric(uA[idxR], P, R).x) ? uA[idxR] :
                            (tInReflected == intersectQuadric(uB[idxR], P, R).x) ? uB[idx] : uC[idxR];

                        isPlaneReflected = idxR;
                        materialReflected = uMaterials[idxR];
                        highlightReflected = uHighlights[idxR];
                        powerReflected = uPowers[idxR];
                    }
                    tMaxReflected = max(tMaxReflected, tOutReflected);

                    vec3 PReflected = P + tMinReflected * R;

                    vec3 NReflected = normalize(vec3(2.0 * QReflected[0][0] * PReflected.x + QReflected[2][0] * PReflected.z + QReflected[0][1] * PReflected.y + QReflected[0][2],
                                                    2.0 * QReflected[1][1] * PReflected.y + QReflected[1][2] * PReflected.z + QReflected[0][1] * PReflected.x + QReflected[1][0],
                                                    2.0 * QReflected[2][2] * PReflected.z + QReflected[1][2] * PReflected.y + QReflected[2][0] * PReflected.x + QReflected[2][1]));

                    vec3 dReflected = material * max(dot(NReflected, L2), max(0.0, dot(NReflected, L1)));
                    reflectedColor += dReflected;
                }
            }


            // color = d + s;
            color = d + s + 0.5 * reflectedColor;
            if (isPlane == 5) {
                color = cloudify2(vec3(0.9, 0.7, 1.0), P.xyz);
            }
            // color *= marble(P.yxz);
        }
    }

    gl_FragColor = vec4(sqrt(color), 1.0);
}
    `
}