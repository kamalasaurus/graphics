'use strict';
import {Linear, Hermite, Bezier, BSpline, CatmullRom} from './splines.js';

void function() {
    const devicePixelRatio = window.devicePixelRatio || 1;

    let canvas = document.getElementById('canvas');
    let render_canvas = document.getElementById('render_canvas');
    let ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;

        render_canvas.width = window.innerWidth * devicePixelRatio;
        render_canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, render_canvas.width, render_canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);

    let coord = (x,y) => {
        return {x, y};
    }

    let getPoint = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX * devicePixelRatio) - rect.left;
        let y = (e.clientY * devicePixelRatio) - rect.top;
        return coord(x, y);
    }

    let setMode = (e) => {
        mode = e.target.id;
        if (mode === "spline")
            document.querySelector('.splines').style.display = 'inline-block';
        else
            document.querySelector('.splines').style.display = 'none';
    }

    let setSpline = (e) => {
        splineType = e.target.id;
        renderPoints();
    }

    let clear = (e) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
        closed = false;
        pixels = [];
        positions = [];
        position = 0;
    }

    let closePoints = (e) => {
        if (points.length < 2) return;
        points.push(points[0]);
        closed = true;
        renderPoints();
        positions = pixels.map(p => canvasToWebGLCoords(p.x, p.y, canvas))
        position = 0;
    }

    let mode = "spline";
    let splineType = "linear";

    let points = [];
    let activePoint = null;
    let closed = false;
    let pixels = [];

    let positions = [];
    let position = 0;

    document.body.addEventListener('mousedown', (e) => {
        switch(e.target.id) {
            case "canvas": canvasDown(e); break;
            case "spline": setMode(e); break;
            case "move": setMode(e); break;
            case "remove": setMode(e); break;
            case "clear": clear(e); break;
            case "close": closePoints(e); break;
            case "linear": setSpline(e); break;
            case "hermite": setSpline(e); break;
            case "bezier": setSpline(e); break;
            case "bspline": setSpline(e); break;
            case "catmullrom": setSpline(e); break;
        }
    })

    document.body.addEventListener('mouseup', (e) => {
        switch(e.target.id) {
            case "canvas": canvasUp(e); break;
        }
    })

    document.body.addEventListener('mousemove', (e) => {
        if (activePoint) {
            let dot = document.getElementById('dot') || redDotCursor(e.clientX, e.clientY);
            let point = getPoint(e);
            activePoint.x = point.x;
            activePoint.y = point.y;
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
            renderPoints();
        }
    })

    let canvasDown = (e) => {
        if (closed) return;
        let point = getPoint(e);
        if (point.y < 40) return;
        let overlap = points.some(p => Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10);
        switch (mode) {
            case "spline": addPoint(point, overlap); break;
            case "move": selectPoint(point, overlap); break;
            case "remove": removePoint(point, overlap); break;
        }
    }

    let canvasUp = (e) => {
        let point = getPoint(e);
        switch (mode) {
            case "spline": renderPoints(); break;
            case "move": movePoint(point); break;
            case "remove": renderPoints(); break;
        }
    }

    let addPoint = (point, overlap) => {
        if (overlap) return;
        points.push(point);
    }

    let selectPoint = (point, overlap) => {
        if (overlap) {
            activePoint = points.find(p => Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10);
        }
    }

    let removePoint = (point, overlap) => {
        if (overlap) {
            points = points.filter(p => Math.abs(p.x - point.x) > 10 || Math.abs(p.y - point.y) > 10);
        }
    }

    let movePoint = (point) => {
        if (activePoint) {
            activePoint.x = point.x;
            activePoint.y = point.y;
            activePoint = null;
        }
        document.getElementById('dot')?.remove();
        renderPoints();
    }

    let renderPoints = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (points.length == 0) return;
        renderCurve();
        points.forEach(p => {
            ctx.fillStyle = 'black';
            ctx.fillRect(p.x-5, p.y-5, 10, 10);
        });
    }

    let renderCurve = () => {
        if (points.length < 2) return;
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        switch (splineType) {
            case "linear": pixels = Linear(ctx, points); break;
            case "hermite": pixels = Hermite(ctx, points); break;
            case "bezier": pixels = Bezier(ctx, points); break;
            case "bspline": pixels = BSpline(ctx, points); break;
            case "catmullrom": pixels = CatmullRom(ctx, points); break;
        }
    }

    let redDotCursor = (x, y) => {
        let dot = document.createElement('div');
        dot.id = 'dot';
        dot.style.position = 'absolute';
        dot.style.width = `${10 / devicePixelRatio}px`;
        dot.style.height = `${10 / devicePixelRatio}px`;
        dot.style.backgroundColor = 'red';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.pointerEvents = 'none';
        document.body.appendChild(dot);
        return dot;
    }

    let canvasToWebGLCoords = (x, y, canvas) => {
        let rect = canvas.getBoundingClientRect();
        let webGLX = ((x - rect.left) / rect.width * 2 - 2) / devicePixelRatio;
        let webGLY = ((rect.height - (y - rect.top)) / rect.height * 2) / devicePixelRatio;
        return { x: webGLX, y: webGLY };
    }

    // start GL coding
    let mInverse = m => {
        let dst = [], det = 0, cofactor = (c, r) => {
           let s = (i, j) => m[c+i & 3 | (r+j & 3) << 2];
           return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                       - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                       + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
        }
        for (let n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
        for (let n = 0 ; n <  4 ; n++) det += m[n] * dst[n << 2]; 
        for (let n = 0 ; n < 16 ; n++) dst[n] /= det;
        return dst;
    }
    let matrixMultiply = (a, b) => {
    let dst = [];
    for (let n = 0 ; n < 16 ; n++)
        dst.push(a[n&3]*b[n&12] + a[n&3|4]*b[n&12|1] + a[n&3|8]*b[n&12|2] + a[n&3|12]*b[n&12|3]);
    return dst;
    }
    let C = t => Math.cos(t);
    let S = t => Math.sin(t);
    let mIdentity = () => [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
    let mPerspective = (fl, m) => matrixMultiply(m, [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1]);
    let mRotateX = (t, m) => matrixMultiply(m, [1,0,0,0, 0,C(t),S(t),0, 0,-S(t),C(t),0, 0,0,0,1]);
    let mRotateY = (t, m) => matrixMultiply(m, [C(t),0,-S(t),0, 0,1,0,0, S(t),0,C(t),0, 0,0,0,1]);
    let mRotateZ = (t, m) => matrixMultiply(m, [C(t),S(t),0,0, -S(t),C(t),0,0, 0,0,1,0, 0,0,0,1]);
    let mScale = (x,y,z, m) => matrixMultiply(m, [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]);
    let mTranslate = (x,y,z, m) => matrixMultiply(m, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);

    function Matrix() {
        let stack = [mIdentity()], top = 0;
        let set = arg => { stack[top] = arg; return this; }
        let get = () => stack[top];
     
        this.identity = () => set(mIdentity());
        this.perspective = fl => set(mPerspective(fl, get()));
        this.rotateX = t => set(mRotateX(t, get()));
        this.rotateY = t => set(mRotateY(t, get()));
        this.rotateZ = t => set(mRotateZ(t, get()));
        this.scale = (x,y,z) => set(mScale(x,y,z, get()));
        this.translate = (x,y,z) => set(mTranslate(x,y,z, get()));
        this.get = () => get();
        this.set = () => set();
        this.save = () => set(stack[top++].slice());
        this.restore = () => --top;
     }

    let start_gl = (canvas, vertexSize, vertexShader, fragmentShader) => {
        let gl = canvas.getContext("webgl");
    
        let program = gl.createProgram();
        gl.program = program;
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
        if (! gl.getProgramParameter(program, gl.LINK_STATUS))
        throw "Could not link the shader program!";
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        let vertexAttribute = (name, size, position) => {
        let attr = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, size, gl.FLOAT, false, vertexSize * 4, position * 4);
        }
        vertexAttribute('aPos', 3, 0);
        vertexAttribute('aNor', 3, 3);
        return gl;
    }

    
    // I'm borrowing some math from this excellent resource https://r-knott.surrey.ac.uk/fibonacci/phi3DGeom.html
    let phi = (1 + Math.sqrt(5)) / 2; // golden ratio
 
    // I tried doing it with the strToTris method -- it was hard to debug :/
    let icosahedron_vertices = [
        [-1,  phi, 0], //0
        [ 1,  phi, 0], //1
        [-1, -phi, 0], //2
        [ 1, -phi, 0], //3
        [ 0, -1,  phi], //4
        [ 0,  1,  phi], //5
        [ 0, -1, -phi], // 6
        [ 0,  1, -phi], // 7
        [ phi, 0, -1], // 8
        [ phi, 0,  1], // 9
        [-phi, 0, -1], // 10
        [-phi, 0,  1] // 11
    ]
    
    let icosahedron_triangles = [
        [0, 11, 5],  [0, 5, 1],  [0, 1, 7],   [0, 7, 10],  [0, 10, 11],
        [1, 5, 9],   [5, 11, 4], [11, 10, 2], [10, 7, 6],  [7, 1, 8],
        [3, 9, 4],   [3, 4, 2],  [3, 2, 6],   [3, 6, 8],   [3, 8, 9],
        [4, 9, 5],   [2, 4, 11], [6, 2, 10],  [8, 6, 7],   [9, 8, 1]
    ]
 
    // I can't believe this worked
    let icosahedron = icosahedron_triangles
        .map(triangle => triangle.map(vertex => icosahedron_vertices[vertex]))
        .map(triangle => {
        let [a, b, c] = triangle;
        // edge vectors -- if you get the edges between vertices you get 2 lines
        let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
        let vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        // cross product -- if you cross them you get the normal vector
        let x = uy * vz - uz * vy;
        let y = uz * vx - ux * vz;
        let z = ux * vy - uy * vx;
        // length
        let length = Math.sqrt(x*x + y*y + z*z);
        // normalized normal
        [x, y, z] = [x, y, z].map(n => n / length);
        return [a, x, y, z, b, x, y, z, c, x, y, z];
        })
        .flat(Infinity)
    
    // DEFINE ALL THE OBJECT COLORS AND SHAPES
    
    let Ico       = { type: 0, mesh: new Float32Array(icosahedron) };
 
    // VERY SIMPLE VERTEX AND FRAGMENT SHADERS
    
    let vertexSize = 6;
    let vertexShader = `
        attribute vec3 aPos, aNor;
        uniform mat4 uMatrix, uInvMatrix;
        varying vec3 vPos, vNor;
        void main() {
            vec4 pos = uMatrix * vec4(aPos, 1.0);
            vec4 nor = vec4(aNor, 0.0) * uInvMatrix;
            vPos = pos.xyz;
            vNor = nor.xyz;
            gl_Position = pos * vec4(1.,1.,-.1,1.);
        }
    `;
    
    let fragmentShader = `
        precision mediump float;
        uniform vec3 uColor;
        uniform float uTime;
        varying vec3 vPos, vNor;
    
        vec3 color;
        float c;
    
        void main(void) {
            if (uColor == vec3(0., 1., 0.)) {
                c = .05 + max(0., dot(normalize(vNor), vec3(.57)));
                color = c * vec3(0.99, 0.99, 0.4);
            } else {
                color = vec3(0.);
            }
            gl_FragColor = vec4(sqrt(color), 1.);
        }
    `;
    
    // INITIALIZE GL AND GET UNIFORM NAMES
    
    let gl = start_gl(render_canvas, vertexSize, vertexShader, fragmentShader);    
    
    let uColor     = gl.getUniformLocation(gl.program, "uColor"    );
    let uInvMatrix = gl.getUniformLocation(gl.program, "uInvMatrix");
    let uMatrix    = gl.getUniformLocation(gl.program, "uMatrix"   );
    let uTime      = gl.getUniformLocation(gl.program, "uTime"    );

    // INSTANTIATE THE MATRIX OBJECT

    let M = new Matrix();

    // RENDER ONE SHAPE, AND GIVE IT A COLOR

    let render = (Shape, color) => {
        gl.uniform3fv      (uColor    , color );
        gl.uniformMatrix4fv(uInvMatrix, false, mInverse(M.get()));
        gl.uniformMatrix4fv(uMatrix   , false, M.get()          );

        let mesh = Shape.mesh;
        gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
        gl.drawArrays(Shape.type ? gl.TRIANGLE_STRIP : gl.TRIANGLES, 0, mesh.length / vertexSize);
    }

    // THE ANIMATION LOOP

    let startTime = Date.now() / 1000;

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        if (positions.length == 0) return;
        let time = Date.now() / 1000 - startTime;
        let {x, y} = positions[position];

        gl.uniform1f(uTime, time);

        M.identity()

        // ANIMATE AND RENDER THE SCENE
        if (closed) {
            M.save();
                M.translate(x, y, 0).scale(.02, .02, .02).rotateY(time).rotateX(time / 2);
                render(Ico, [0, 1, 0]); // Ground
            M.restore();
            ++position;
            if (position >= positions.length) position = 0;
        }
    }    

    resizeCanvas();
    requestAnimationFrame(renderFrame);
}();