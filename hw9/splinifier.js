'use strict';
import {Linear, Cubic, Hermite, Bezier, BSpline, CatmullRom} from './splines.js';

void function() {
    const devicePixelRatio = window.devicePixelRatio || 1;

    let canvas = document.getElementById('canvas');
    let render_canvas = document.getElementById('render_canvas');
    let ctx = canvas.getContext('2d');
    let gl = render_canvas.getContext('webgl');

    function resizeCanvas() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;

        render_canvas.width = window.innerWidth * devicePixelRatio;
        render_canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, render_canvas.width, render_canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let coord = (x,y) => {
        return {x, y};
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
    }

    let clear = (e) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
        closed = false;
    }

    let closePoints = (e) => {
        if (points.length < 2) return;
        points.push(points[0]);
        closed = true;
        renderPoints();
    }

    let mode = "spline";
    let splineType = "linear";

    let points = [];
    let activePoint = null;
    let closed = false;

    document.body.addEventListener('mousedown', (e) => {
        switch(e.target.id) {
            case "canvas": canvasDown(e); break;
            case "spline": setMode(e); break;
            case "move": setMode(e); break;
            case "remove": setMode(e); break;
            case "clear": clear(e); break;
            case "close": closePoints(e); break;
            case "linear": setSpline(e); break;
            case "cubic": setSpline(e); break;
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
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
        }
    })

    let canvasDown = (e) => {
        if (closed) return;
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX * devicePixelRatio) - rect.left;
        let y = (e.clientY * devicePixelRatio) - rect.top;
        let point = coord(x, y);
        if (point.y < 40) return;
        let overlap = points.some(p => Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10);
        switch (mode) {
            case "spline": addPoint(point, overlap); break;
            case "move": selectPoint(point, overlap); break;
            case "remove": removePoint(point, overlap); break;
        }
    }

    let canvasUp = (e) => {
        switch (mode) {
            case "spline": renderPoints(); break;
            case "move": movePoint(e); break;
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

    let movePoint = (e) => {
        if (activePoint) {
            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX * devicePixelRatio) - rect.left;
            let y = (e.clientY * devicePixelRatio) - rect.top;
            activePoint.x = x;
            activePoint.y = y;
            activePoint = null;
        }
        document.getElementById('dot').remove();
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
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        switch (splineType) {
            case "linear": Linear(ctx, points); break;
            case "cubic": Cubic(ctx, points); break;
            case "hermite": Hermite(ctx, points); break;
            case "bezier": Bezier(ctx, points); break;
            case "bspline": BSpline(ctx, points); break;
            case "catmullrom": CatmullRom(ctx, points); break;
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
}();