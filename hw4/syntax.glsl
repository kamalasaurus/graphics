         precision mediump float;
         uniform float uTime, uFL;
         uniform vec3 uCursor;
         varying vec3 vPos;
         uniform vec3 uL;
         uniform mat4 uA[`+NQ+`], uB[`+NQ+`], uC[`+NQ+`];

         uniform vec3 uMaterials[4]; // Array of material colors
         uniform vec3 uHighlights[4]; // Array of highlight colors
         uniform float uPowers[4]; // Array of power values

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

         float intersectQuadric(float a, float b, float c, float d, float e, float f, float g, float h, float i, float j, vec3 V, vec3 W) {
            float VW = dot(V, W); // Compute the dot product of V with the ray direction W (V.W)
            float VV = dot(V, V); // Compute the dot product of V with itself (V.V)
            float r = sqrt(a * a + b * b + c * c); // Compute the radius (example calculation, adjust as needed)
            float d = VW * VW - (VV - r * r); // Compute the discriminant
            if (d > 0.0) {
               return -VW - sqrt(d); // Return the distance to the intersection point
            }
            return -1.0; // No intersection
         }

         void main() {
            vec3 color = vec3(0.);
            vec3 N = normalize(vPos);
            vec3 L = normalize(uL);
            vec3 R = reflect(-L, N);

            vec3 V = vec3(0.);  // Ray Origin
            vec3 W = normalize(vec3(vPos.xy,-uFL));  // Ray Direction

            float tMin = 10000000; // Initialize tMin to a large value

            for (int i = 0; i < `+NQ+`; i++) {
               mat4 Q = uA[i];

               float a = Q[0].x;
               float b = Q[1].y;
               float c = Q[2].z;
               float d = Q[1].z;
               float e = Q[2].x;
               float f = Q[0].y;
               float g = Q[0].z;
               float h = Q[1].x;
               float i = Q[2].y;
               float j = Q[3].w;

               // Compute intersection distance for quadric uA
               float tA = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, W);
               if (tA > 0.0 && tA < tMin) {
                     tMin = tA;
               }

               // Compute intersection distance for quadric uB
               Q = uB[i];
               a = Q[0].x;
               b = Q[1].y;
               c = Q[2].z;
               d = Q[1].z;
               e = Q[2].x;
               f = Q[0].y;
               g = Q[0].z;
               h = Q[1].x;
               i = Q[2].y;
               j = Q[3].w;

               float tB = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, W);
               if (tB > 0.0 && tB < tMin) {
                     tMin = tB;
               }

               // Compute intersection distance for quadric uC
               Q = uC[i];
               a = Q[0].x;
               b = Q[1].y;
               c = Q[2].z;
               d = Q[1].z;
               e = Q[2].x;
               f = Q[0].y;
               g = Q[0].z;
               h = Q[1].x;
               i = Q[2].y;
               j = Q[3].w;

               float tC = intersectQuadric(a, b, c, d, e, f, g, h, i, j, V, W);
               if (tC > 0.0 && tC < tMin) {
                     tMin = tC;

                     vec3 P = V + tMin * W;

                     // Compute the normal at P for a generic quadric
                     vec3 N = normalize(vec3(
                        2.0 * a * P.x + e * P.z + f * P.y + g,
                        2.0 * b * P.y + d * P.z + f * P.x + h,
                        2.0 * c * P.z + d * P.y + e * P.x + i
                     ));

                     color = 0.2 * uMaterials[1];
                     color += vec3(0.1 + max(0.0, dot(N, vec3(0.5))));
               }
            }

            gl_FragColor = vec4(sqrt(color), 1.);
         }