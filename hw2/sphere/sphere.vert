attribute vec3 aPos;
varying   vec3 vPos;

void main() {
  gl_Position = vec4(aPos, 1.0);
  vPos = aPos;
}