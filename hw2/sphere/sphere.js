import { RenderContext } from '../smart-canvas.js'

export default class Sphere extends RenderContext{
  constructor(gl, program) {
    super(gl, program)

    // gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    // this.meshData = [
    //     { type: 1, mesh: new Float32Array([ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]) },
    // ];

    // this.NSPHERES = 5;
    // let vertexSize = 3;

    // let vertexAttribute = (name, size, position) => {
    //     let attr = gl.getAttribLocation(program, name);
    //     gl.enableVertexAttribArray(attr);
    //     gl.vertexAttribPointer(attr, size, gl.FLOAT, false, vertexSize * 4, position * 4);
    // }

    // vertexAttribute('aPos', 3, 0);

    // this.uFL       = gl.getUniformLocation(program, "uFL"      );
    // this.uTime     = gl.getUniformLocation(program, "uTime"    );
    // this.uCursor   = gl.getUniformLocation(program, "uCursor"  ); 
    // this.uSpheres  = gl.getUniformLocation(program, "uSpheres" ); 
 
    gl.useProgram(program)
  }

  loop(gl, cursor) {
    // this.clear(0.75, 0.85, 0.8, 1.0)

    // let time = performance.now();

    // gl.uniform1f(this.uTime, time);
    // gl.uniform3fv(this.uCursor, cursor);
    // gl.uniform1f(this.uFL, 3);

    // let data = [];
    // for (let n = 0 ; n < this.NSPHERES ; n++) {
    //    let theta = time + 2 * Math.PI * n / this.NSPHERES;
    //    let c = .15 * Math.cos(theta);
    //    let s = .15 * Math.sin(theta);
    //    data.push(c, 0, -1 + s, -.08);
    // }

    // gl.uniform4fv(this.uSpheres, data);

    // // RENDER THE FRAME

    // for (let n = 0 ; n < this.meshData.length ; n++) {
    //    let mesh = this.meshData[n].mesh;
    //    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
    //    gl.drawArrays(this.meshData[n].type ? gl.TRIANGLE_STRIP : gl.TRIANGLES, 0, mesh.length / this.vertexSize);
    // }
  }

  resize(gl) {
    let [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]
    console.log(width, height)
  }
}
