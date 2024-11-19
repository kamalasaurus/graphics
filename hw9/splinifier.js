'use strict';

function coord(x,y) {
    return {x, y};
}

void function() {
    let canvas = document.getElementById('canvas');
    let render_canvas = document.getElementById('render_canvas');
    let ctx = canvas.getContext('2d');
    let gl = render_canvas.getContext('webgl');

    let mode = "spline";

    function resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;

        render_canvas.width = window.innerWidth * devicePixelRatio;
        render_canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, render_canvas.width, render_canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let points = [];

    canvas.addEventListener('mousedown', (e) => {
        // get the pixel position of the mouse
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        points.push(coord(x, y));
    })

    canvas.addEventListener('mouseup', (e) => {
        let point = points[points.length - 1];
        switch (mode) {
            case "spline":
                // set fill color
                ctx.fillStyle = 'red';
                // draw rectangle centered at the point
                ctx.fillRect(point.x-5, point.y-5, 10, 10);
                break;
            case "move":
                // draw circle centered at the point
                // ctx.beginPath();
                // ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                // ctx.fill();
                break;
        }

        // let ctx = canvas.getContext('2d');
        // ctx.beginPath();
        // ctx.moveTo(coords.x, coords.y);
        // ctx.lineTo(x, y);
        // ctx.closePath();
        // ctx.stroke();
    })

    clear.addEventListener('mousedown', (e) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
    });

    spline.addEventListener('mousedown', (e) => {
        mode = "spline";
    });

    move.addEventListener('mousedown', (e) => {
        mode = "move";
    });

    [
       {x: 100, y: 100},
       {x: 200, y: 100},
       {x: 200, y: 200},
       {x: 100, y: 200}
    ].forEach((point) => {
        points.push(point);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        // ctx.fill();
    });
    // let splines = points;
    // ctx.beginPath();
    // ctx.moveTo(splines[0].x, splines[0].y);
    // for (let i = 1; i < splines.length; i++) {
    //    ctx.lineTo(splines[i].x, splines[i].y);
    // }
    ctx.closePath();
    ctx.stroke();


}();