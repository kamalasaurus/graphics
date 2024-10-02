export default class Triangle {
  constructor(gl, program) {
    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      let triangleVertices = [ // X, Y,  R, G, B
        0.0, 0.5,        1.0, 1.0, 0.0,
        -0.5, -0.5,      0.7, 0.0, 1.0,
        0.5, -0.5,       0.1, 1,0, 0.6
      ]

      let triangleVertexBufferObject = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

      let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
      let colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
      gl.vertexAttribPointer(
        positionAttribLocation, // attribute location
        2, // length of input vec
        gl.FLOAT, // type of vec
        gl.FALSE, // Normalized?
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex,
        0// offset from the beginning of a single vertex to this attrib
      )
      gl.vertexAttribPointer(
        colorAttribLocation, // attribute location
        3, // length of input vec
        gl.FLOAT, // type of vec
        gl.FALSE, // Normalized?
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex,
        2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attrib
      )

      gl.enableVertexAttribArray(positionAttribLocation)
      gl.enableVertexAttribArray(colorAttribLocation)

      gl.useProgram(program)
  }

  loop(gl, cursor) {
    gl.clear(0.75, 0.85, 0.8, 1.0)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  resize(gl) {
    let [width, height] = [gl.drawingBufferWidth, gl.drawingBufferHeight]
    console.log(width, height)
  }
}
