export function Linear(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        let p0 = points[i];
        let p1 = points[i + 1];
        ctx.lineTo(p1.x, p1.y);
    }
    ctx.stroke();
    ctx.closePath();
}

export function Cubic(ctx, points) {
    // constructor(p0, p1, p2, p3) {
    //     this.p0 = p0;
    //     this.p1 = p1;
    //     this.p2 = p2;
    //     this.p3 = p3;
    // }

    // at(t) {
    //     let t2 = t * t;
    //     let t3 = t2 * t;
    //     let a = this.p3 - this.p2 - this.p0 + this.p1;
    //     let b = this.p0 - this.p1 - a;
    //     let c = this.p2 - this.p0;
    //     let d = this.p1;
    //     return a * t3 + b * t2 + c * t + d;
    // }
}

export function Hermite(ctx, points) {
    // constructor(p0, p1, m0, m1) {
    //     this.p0 = p0;
    //     this.p1 = p1;
    //     this.m0 = m0;
    //     this.m1 = m1;
    // }

    // at(t) {
    //     let t2 = t * t;
    //     let t3 = t2 * t;
    //     let a = 2 * t3 - 3 * t2 + 1;
    //     let b = t3 - 2 * t2 + t;
    //     let c = -2 * t3 + 3 * t2;
    //     let d = t3 - t2;
    //     return a * this.p0 + b * this.m0 + c * this.p1 + d * this.m1;
    // }
}

export function Bezier(ctx, points) {
    // constructor(p0, p1, p2, p3) {
    //     this.p0 = p0;
    //     this.p1 = p1;
    //     this.p2 = p2;
    //     this.p3 = p3;
    // }

    // at(t) {
    //     let t2 = t * t;
    //     let t3 = t2 * t;
    //     let a = -this.p0 + 3 * this.p1 - 3 * this.p2 + this.p3;
    //     let b = 3 * this.p0 - 6 * this.p1 + 3 * this.p2;
    //     let c = -3 * this.p0 + 3 * this.p1;
    //     let d = this.p0;
    //     return a * t3 + b * t2 + c * t + d;
    // }
}

export function BSpline(ctx, points) {
    // constructor(p0, p1, p2, p3) {
    //     this.p0 = p0;
    //     this.p1 = p1;
    //     this.p2 = p2;
    //     this.p3 = p3;
    // }

    // at(t) {
    //     let t2 = t * t;
    //     let t3 = t2 * t;
    //     let a = -1 * t3 + 3 * t2 - 3 * t + 1;
    //     let b = 3 * t3 - 6 * t2 + 0 * t + 4;
    //     let c = -3 * t3 + 3 * t2 + 3 * t + 1;
    //     let d = 1 * t3 + 0 * t2 + 0 * t + 0;
    //     return a * this.p0 + b * this.p1 + c * this.p2 + d * this.p3;
    // }
}

export function CatmullRom(ctx, points) {
    // constructor(p0, p1, p2, p3) {
    //     this.p0 = p0;
    //     this.p1 = p1;
    //     this.p2 = p2;
    //     this.p3 = p3;
    // }

    // at(t) {
    //     let t2 = t * t;
    //     let t3 = t2 * t;
    //     let a = -0.5 * t3 + t2 - 0.5 * t;
    //     let b = 1.5 * t3 - 2.5 * t2 + 1;
    //     let c = -1.5 * t3 + 2 * t2 + 0.5 * t;
    //     let d = 0.5 * t3 - 0.5 * t2;
    //     return a * this.p0 + b * this.p1 + c * this.p2 + d * this.p3;
    // }
}

export default {Linear, Cubic, Hermite, Bezier, BSpline, CatmullRom};