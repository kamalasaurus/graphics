precision mediump float;

uniform float uTime, uFL;
uniform vec3  uCursor;
uniform vec4  uSpheres[5];
varying vec3  vPos;

// vec3 bgColor = vec3(0.,0.,.05);

// float raySphere(vec3 V, vec3 W, vec3 C, float r) {
//   V -= C;
//   float VV = dot(V,V);
//   float VW = dot(V,W);
//   float d = VW * VW - (VV - r*r);
//   if (d > 0.)
//       return -VW - sqrt(d);
//   return -1.;
// }

void main(void) {

  // SET BACKGROUND COLOR

  // vec3 color = bgColor;

  // // FORM THE RAY FOR THIS PIXEL

  // vec3 V = vec3(0.);
  // vec3 W = normalize(vec3(vPos.xy,-uFL));

  // vec3 L = normalize(vec3(1.));

  // vec3 material, highlight;
  // float power;

  // if (uCursor.x < -.3) {
  //   material = vec3(.5,.17,0.);    // GOLD
  //   highlight = 1.2 * material;
  //   power = 8.;
  // } else if (uCursor.x > .3) {
  //   material = vec3(.4,.05,.0);    // COPPER
  //   highlight = 1.2 * material;
  //   power = 6.;
  // } else {
  //   material = vec3(1.,0.,0.);    // RED PLASTIC
  //   highlight = vec3(1.);
  //   power = 20.;
  // }

  // float tMin = 1000.;
  // for (int i = 0 ; i < 5 ; i++) {
  //   vec3  C = uSpheres[i].xyz;
  //   float r = uSpheres[i].w;
  //   float t = raySphere(V, W, C, r);
  //   if (t > 0. && t < tMin) {
  //     tMin = t;
  //     vec3 P = V + t * W;
  //     vec3 N = normalize(P - C);
  //     color = .2 * material;

  //     bool inShadow = false;
  //     for (int j = 0 ; j < 5 ; j++)
  //       if (j != i) {
  //         vec3  C = uSpheres[j].xyz;
  //         float r = uSpheres[j].w;
  //         if (raySphere(P, L, C, r) > 0.)
  //         inShadow = true;
  //       }

  //     if (! inShadow) {
  //       vec3 d = material * max(0., dot(N,L));
  //       vec3 E = vec3(0.,0.,1.);
  //       vec3 R = W - 2. * N * dot(N, W);
  //       vec3 s = highlight * pow(max(0., dot(R, L)), power);
  //             color += d + s;
  //     }
  //   }
  // }

  // gl_FragColor = vec4(sqrt(color), 1.);
  gl_FragColor = vec4(0.,0.,0.,1.);
}