#version 300 es

precision mediump float;

in vec2 vertPosition;
in vec3 vertColor;
out vec3 fragColor;

void main() {
  fragColor = vertColor;
  gl_Position = vec4(vertPosition, 0.0, 1.0);
}