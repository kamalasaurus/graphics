export default function _fragmentShader(NSPHERES) {
    return `
    precision mediump float;
    uniform float uTime, uFL;
    uniform vec3  uCursor;
    uniform vec4  uSpheres[${NSPHERES}];
    varying vec3  vPos;

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

    vec3 marble(vec3 pos) {
        float v = turbulence(pos);
        float s = sqrt(.5 + .5 * sin(20. * pos.y + 8. * v));
        return vec3(.8,.7,.5) * vec3(s,s*s,s*s*s);
    }

    float raySphere(vec3 V, vec3 W, vec3 C, float r) {
        V -= C; // Translate the ray origin to the sphere's local coordinate system
        float VV = dot(V, V); // Compute the dot product of V with itself (V.V)
        float VW = dot(V, W); // Compute the dot product of V with the ray direction W (V.W)
        float d = VW * VW - (VV - r * r); // Compute the discriminant
        if (d > 0.0) {
            return -VW - sqrt(d); // Return the distance to the intersection point
        }
        return -1.0; // No intersection
    }

    // Define the plane from inigo quilez
    float rayPlane(vec3 V, vec3 W, vec3 P, vec3 N) {
        float denom = dot(N, W);
        if (abs(denom) > 0.0001) { // Avoid division by zero
            float t = dot(P - V, N) / denom;
            return t > 0.0 ? t : -1.0;
        }
        return -1.0;
    }

    void main(void) {
        // SET BACKGROUND COLOR

        vec3 bgColor;

        if (uCursor.y < -.3) {
            bgColor = vec3(.3,.6,1.);
        } else if (uCursor.y > .3) {
            bgColor = vec3(.1,1.,1.);
        } else {
            bgColor = vec3(1.,.1,1.);
        }

        float y = .1 * vPos.y - .3;
        y += turbulence(.5 * vPos + vec3(.03*uTime,0.,.03*uTime));
        bgColor = mix(bgColor, (vec3(.5) * bgColor), y<0.?0.:y>.1?1.:y/.1);
        bgColor = mix(bgColor, vec3(1.7), y<.1?0.:y-.1);

        // Plane parameters
        vec3 planePoint = vec3(0.0, -1.0, 0.0); // A point on the plane
        vec3 planeNormal = vec3(0.0, 1.0, 0.0); // Plane normal

        // FORM THE RAY FOR THIS PIXEL

        vec3 V = vec3(0.);  // Ray Origin
        vec3 W = normalize(vec3(vPos.xy,-uFL));  // Ray Direction

        // Check for intersection with the plane
        float tPlane = rayPlane(V, W, planePoint, planeNormal);
        vec3 color = bgColor;

        vec3 L = normalize(vec3(-1., 0.01, 1.));  // Light direction

        if (tPlane > 0.0) {
            vec3 hitPoint = V + tPlane * W;
            color = vec3(0.5, 0.8, 0.5); // Plane color
            // color += .2 * uMaterials[1] *. max(0.0, dot(planeNormal, L));
            color *= 0.9 - marble(sin(hitPoint.yxz + 0.1 * uTime) + 2. * cos(hitPoint.yzx + 0.05 * uTime));
        }

        vec3 material;
        vec3 highlight;
        float power;

        float tMin = 1000.;
        for (int i = 0 ; i < ${NSPHERES} ; i++) {
            vec3  C = uSpheres[i].xyz; // Sphere center
            float r = uSpheres[i].w / float(i + 1); // Sphere radius

            C.y -= r;

            material = uMaterials[i];
            highlight = uHighlights[i];
            power = uPowers[i];

            float t = raySphere(V, W, C, r);
            if (t > 0. && t < tMin) {
                tMin = t;
                vec3 P = V + t * W;
                vec3 N = normalize(P - C);
                color = .2 * material;

                color += vec3(.1 + max(0., dot(N, vec3(.5))));;
                color *= marble(P.yxz);

                bool inShadow = false;
                for (int j = 0 ; j < ${NSPHERES} ; j++)
                    if (j != i) {
                        vec3  C = uSpheres[j].xyz;
                        float r = uSpheres[j].w / float(i + 1);
                        if (raySphere(P, L, C, r) > 0.)
                            inShadow = true;
                    }

                if (! inShadow) {
                    vec3 d = material * max(0., dot(N,L));
                    vec3 E = vec3(0.,0.,1.);
                    vec3 R = W - 2. * N * dot(N, W);
                    vec3 s = highlight * pow(max(0., dot(R, L)), power);
                    color += d + s;
                }
            }
            
            // for the life of me I could not figure out how to cast shadows on the plane
            // else {
            //     // Check for intersection with the plane
            //     if (tPlane > 0.0) {
            //         vec3 hitPoint = V + tPlane * W;
            //         vec3 planeNormal = vec3(0.0, 1.0, 0.0); // Plane normal
            //         bool planeInShadow = false;

            //         // Check if the light ray from the hit point to the light source intersects any spheres
            //         for (int j = 0; j < ${NSPHERES}; j++) {
            //             vec3 C = uSpheres[j].xyz;
            //             float r = uSpheres[j].w;
            //             if (raySphere(hitPoint, L, C, r) > 0.0) {
            //                 planeInShadow = true;
            //                 break;
            //             }
            //         }

            //         if (!planeInShadow) {
            //             vec3 d = vec3(0.5, 0.5, 0.5) * max(0.0, dot(planeNormal, L));
            //             color += d;
            //         } else {
            //             // Apply shadow color
            //             color *= 0.5; // Darken the color to simulate shadow
            //         }
            //     }
            // }
        }

        gl_FragColor = vec4(sqrt(color), 1.);
    }
    `
}