export function Linear(ctx, points, pixels) {
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

export function Hermite(ctx, points) {
    const tangents = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
        if (i === 0) {
            // Tangent at the first point
            tangents.push([points[1].x - points[0].x, points[1].y - points[0].y]);
        } else if (i === n - 1) {
            // Tangent at the last point
            tangents.push([points[n - 1].x - points[n - 2].x, points[n - 1].y - points[n - 2].y]);
        } else {
            // Tangents for intermediate points
            tangents.push([
                (points[i + 1].x - points[i - 1].x) / 2,
                (points[i + 1].y - points[i - 1].y) / 2
            ]);
        }
    }

    let hermiteBasis = (t) => {
        return [
            2 * t ** 3 - 3 * t ** 2 + 1,  // H0
            -2 * t ** 3 + 3 * t ** 2,    // H1
            t ** 3 - 2 * t ** 2 + t,     // H2
            t ** 3 - t ** 2              // H3
        ];
    }

    let hermiteSpline = (P0, P1, T0, T1, numPoints = 100) =>{
        const curve = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const [H0, H1, H2, H3] = hermiteBasis(t);

            const x = H0 * P0.x + H1 * P1.x + H2 * T0[0] + H3 * T1[0];
            const y = H0 * P0.y + H1 * P1.y + H2 * T0[1] + H3 * T1[1];

            curve.push([x, y]);
        }
        return curve;
    }


    ctx.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const T0 = tangents[i];
        const T1 = tangents[i + 1];

        const curve = hermiteSpline(P0, P1, T0, T1);

        // Draw the curve
        ctx.moveTo(curve[0][0], curve[0][1]);
        for (let j = 1; j < curve.length; j++) {
            ctx.lineTo(curve[j][0], curve[j][1]);
        }
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.closePath();

    // Draw tangents
    // ctx.strokeStyle = "green";
    // tangents.forEach(([tx, ty], i) => {
    //     const {x: px, y: py} = points[i];
    //     ctx.beginPath();
    //     ctx.moveTo(px, py);
    //     ctx.lineTo(px + tx / 3, py + ty / 3); // Scale for visualization
    //     ctx.stroke();
    //     ctx.closePath();
    // });
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
    let catmullRom = (K, t) => {
        let n = K.length - 1, i = floor(n * t), f = (n * t) % 1;
        let A = K[max(0, i-1)], B = K[i], C = K[i+1], D = K[min(n, i+2)];
        return ((((-A+3*B-3*C+D) * f + (2*A-5*B+4*C-D)) * f + (-A+C)) * f + 2*B) / 2;
    }
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

export default {Linear, Hermite, Bezier, BSpline, CatmullRom};