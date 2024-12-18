let vertexSize = 3; // Only need position coordinates now

let vertexShader = `
   attribute vec3 aPos;
   uniform mat4 uMatrix, uVMatrix;
   void main() {
      vec4 pos = uVMatrix * uMatrix * vec4(aPos, 1.0);
      gl_Position = pos;
   }
`;

let fragmentShader = `
   precision mediump float;
   uniform vec3 uColor;
   void main() {
      gl_FragColor = vec4(uColor, 1.0);
   }
`;

// Matrix math support
let mxm = (a, b) => {
   let d = [];
   for (let n = 0 ; n < 16 ; n++)
      d.push(a[n&3]*b[n&12] + a[n&3|4]*b[n&12|1] + a[n&3|8]*b[n&12|2] + a[n&3|12]*b[n&12|3]);
   return d;
}
let C = t => Math.cos(t), S = t => Math.sin(t);
let mIdentity = () => [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
let mPerspective = fl => [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1];
let mRotateX = t => [1,0,0,0, 0,C(t),S(t),0, 0,-S(t),C(t),0, 0,0,0,1];
let mRotateY = t => [C(t),0,-S(t),0, 0,1,0,0, S(t),0,C(t),0, 0,0,0,1];
let mRotateZ = t => [C(t),S(t),0,0, -S(t),C(t),0,0, 0,0,1,0, 0,0,0,1];
let mScale = (x,y,z) => [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
let mTranslate = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];

// TRACK THE MOUSE

let trackMouse = canvas => {
   canvas.rx = 0;
   canvas.ry = 0;
   canvas.zoom = 1.0;  // Add zoom factor
   canvas.onmousedown = e => {
      canvas.pressed = true;
      canvas.mx = e.clientX;
      canvas.my = e.clientY;
   }
   canvas.onmousemove = e => {
      if (canvas.pressed) {
         canvas.rx += e.clientX - canvas.mx;
         canvas.ry += e.clientY - canvas.my;
         canvas.mx = e.clientX;
         canvas.my = e.clientY;
      }
   }
   canvas.onmouseup = e => canvas.pressed = undefined;
   
   // Use addEventListener with passive option
   canvas.addEventListener('wheel', e => {
      e.preventDefault();
      canvas.zoom *= (1 - e.deltaY * 0.001);
      canvas.zoom = Math.max(0.1, Math.min(10.0, canvas.zoom));
   }, { passive: false });  // We need passive: false because we're calling preventDefault
}

let gl, uColor, uMatrix, uVMatrix;

// Spline primitive
let Spline = (gl, points) => {
   return { 
      type: gl.LINE_STRIP,
      mesh: new Float32Array(points),
      count: points.length / 3
   };
}

function Matrix() {
   let stack = [mIdentity()], top = 0;
   let set = arg => { stack[top] = arg; return this; }
   let get = () => stack[top];
   this.identity  = ()      => set(mIdentity());
   this.perspective = fl    => set(mxm(get(), mPerspective(fl)));
   this.turnX    = t        => set(mxm(get(), mRotateX(t)));
   this.turnY    = t        => set(mxm(get(), mRotateY(t)));
   this.turnZ    = t        => set(mxm(get(), mRotateZ(t)));
   this.scale    = (x,y,z)  => set(mxm(get(), mScale(x,y?y:x,z?z:x)));
   this.move     = (x,y,z)  => set(mxm(get(), mTranslate(x,y,z)));
   this.get = () => get();
   this.S = () => set(stack[top++].slice());
   this.R = () => --top;
   this.draw = (shape,color) => draw(shape,color);
}

let startGL = canvas => {
   gl = canvas.getContext("webgl");
   let program = gl.createProgram();
   let addshader = (type, src) => {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
         throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
      gl.attachShader(program, shader);
   };
   addshader(gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   gl.useProgram(program);

   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   let aPos = gl.getAttribLocation(program, "aPos");
   gl.enableVertexAttribArray(aPos);
   gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 12, 0);
   
   uColor = gl.getUniformLocation(program, "uColor");
   uMatrix = gl.getUniformLocation(program, "uMatrix");
   uVMatrix = gl.getUniformLocation(program, "uVMatrix");
   
   gl.clearColor(1.0, 1.0, 1.0, 1.0);  // White background
   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   gl.lineWidth(2.0);  // Make lines thicker

   // After GL is initialized, create the Spline function and drawScene
   window.Spline = Spline;
   return gl;
}

let M = new Matrix();
let VM = new Matrix();
VM.identity();

let draw = (shape, color) => {
    gl.uniform3fv(uColor, color);
    gl.uniformMatrix4fv(uVMatrix, false, VM.get());
    gl.uniformMatrix4fv(uMatrix, false, M.get());
    gl.bufferData(gl.ARRAY_BUFFER, shape.mesh, gl.STATIC_DRAW);
    gl.drawArrays(shape.type, 0, shape.count);
    return M;
}
