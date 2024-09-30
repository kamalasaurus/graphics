uniform float uTime;   // TIME, IN SECONDS

varying vec3 vPos;     // -1 < vPos.x < +1
                       // -1 < vPos.y < +1
                       //      vPos.z == 0

 // A FRAGMENT SHADER MUST DEFINE main().


// octahedron code from inigo quilez https://iquilezles.org/articles/distfunctions/
float octahedron( vec3 p, float s) {
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}

float rotatedOct( in vec3 pos ) {
  float rad = 0.1*(0.5+0.5*sin(uTime*2.0));
  return octahedron(pos,0.5-rad) - rad;
}

// also from iquilez ...  I don't think I understand the function correctly, but it splits the diamonds into sub-planes for the "octahedron" -- I notice it's swizzling a 2D vector to make the planes, but I'm not sure I understand that fully
vec3 calcNormal( in vec3 pos ){
  vec2 e = vec2(1.0,-1.0)*0.5773;
  const float eps = 0.0005;
  return normalize( e.xyy*rotatedOct( pos + e.xyy*eps ) + 
          e.yyx*rotatedOct( pos + e.yyx*eps ) + 
          e.yxy*rotatedOct( pos + e.yxy*eps ) + 
          e.xxx*rotatedOct( pos + e.xxx*eps ) );
}
   
// from wikipedia
mat2 rotate(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

// from wikipedia -- I was trying to rotate the shape in 3d originally, but I just ended up creating weird distortions
mat3 rotate3(float angle) {
  // for some reason x and y just stretch in 2D ...  I guess truncating off the z coordinate isn't the right way to project 3D rotations in 2D space
  //x 1., 0., 0., 0., cos(angle), -sin(angle), 0.,  sin(angle), cos(angle)
  //y cos(angle), 0., sin(angle), 0., 1., 0., -sin(angle), 0., cos(angle)
  //z cos(angle), -sin(angle), 0.,  sin(angle), cos(angle), 0., 0., 0., 1.
  return mat3(cos(angle), -sin(angle), 0.,  sin(angle), cos(angle), 0., 0., 0., 1.);
}

void main() {

// SET A COLOR FOR THIS FRAGMENT.

  // mix(A , B , float)

  // this makes a cloud-like thing -- how to layer noise to make more realistic clouds?  How do I make them move in an angle instead of against a flat background?
  vec3 rgb = mix(vec3(.98,.98,.99), vec3(.2,.8,1.), .5 + 5. * noise(.75 * vPos + (uTime/2.) ));

  for (int i = 0 ; i < 1 ; i++) {

      float u = 5. * vPos.x + 2. * cos(uTime/1.);
      float v = 5. * vPos.y + 2. * sin(uTime/.25);
      float w = vPos.z;

      //vec3 xyz = rotate3(sin(uTime)) * vec3(u,v,w);
      vec3 xyz = vec3(rotate(sin(uTime)) * vec2(u,v), 0.);

      vec3 lightDir = normalize(vec3(cos(uTime),sin(uTime),1.));

      // calcNormal recomputes this..  I'm not sure. This returns a float, but I'm not sure what to make of it?  I thought it would be bright if an octahedron plane exists on the pixel, but I'm not sure.
      float oct = rotatedOct(xyz);

      if (vPos.y >= 0.) {
        if (oct < 0.) {
          vec3 norm = calcNormal(xyz);
          rgb = 0.5 - norm * lightDir;
        }
      }


      // I don't know exactly what's happening here but it looks cool, but it overwrites with each iteration -- I wonder if I can have them flying around together?  The conditional difference here is I'm checking if oct > 0.
      if (vPos.y < 0.) {
        if (oct > 0.) {
          float b = max(0., dot(xyz, lightDir));
          rgb = vec3(.1,.05,.05) + .8 * vec3(b) * vec3(.2,.5,1.);
          rgb *= 1.+ .5 + noise(3. * vec3(xyz.x,xyz.y,xyz.z + .1 * uTime));
        }
      }
  }

  gl_FragColor = vec4(sqrt(rgb), 1.0);
} 