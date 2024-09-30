 uniform float uTime;   // TIME, IN SECONDS

 varying vec3 vPos;     // -1 < vPos.x < +1
                        // -1 < vPos.y < +1
                        //      vPos.z == 0

 // A FRAGMENT SHADER MUST DEFINE main().

 void main() {

 // SET A COLOR FOR THIS FRAGMENT.

    // mix(A , B , float)

    vec3 rgb = mix(vec3(.2,.05,.05), vec3(0.,.3,1.), .5 + .5 * vPos.y);

    for (int i = 0 ; i < 20 ; i++) {

       float x = 8. * vPos.x + 20. * noise(10. * vec3(float(i)) + 100. + .1 * uTime);
       float y = 8. * vPos.y + 20. * noise(10. * vec3(float(i)) + 200. + .1 * uTime);

       //x += .1 * noise(3. * vPos);
       //y += .1 * noise(3. * vPos + 100. + uTime);

       vec3 lightDir = normalize(vec3(sin(uTime),1.,1.));

       float rr = 1. - x*x - y*y;
       if (rr > 0.) {
          float z = sqrt(rr);
          float b = max(0., dot(vec3(x,y,z), lightDir));
          rgb = vec3(.1,.05,.05) + .8 * vec3(b) * vec3(.2,.5,1.);
          rgb *= 1. + .5 * noise(3. * vec3(x,y,z + .1 * uTime));
       }
    }

    gl_FragColor = vec4(sqrt(rgb), 1.0);
 }