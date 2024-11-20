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
            2 * t ** 3 - 3 * t ** 2 + 1, // a
            -2 * t ** 3 + 3 * t ** 2,    // b
            t ** 3 - 2 * t ** 2 + t,     // c
            t ** 3 - t ** 2              // d
        ];
    }

    let hermiteSpline = (P0, P1, R0, R1, numPoints = 100) => {
        const curve = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const [a, b, c, d] = hermiteBasis(t);

            const x = a * P0.x + b * P1.x + c * R0[0] + d * R1[0];
            const y = a * P0.y + b * P1.y + c * R0[1] + d * R1[1];

            curve.push([x, y]);
        }
        return curve;
    }


    ctx.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const R0 = tangents[i];
        const R1 = tangents[i + 1];

        const curve = hermiteSpline(P0, P1, R0, R1);

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
}

export function Bezier(ctx, points) {
    let bezierBasis = (t) => {
        return [
            (1 - t) ** 3,           // a
            3 * t * (1 - t) ** 2,   // b
            3 * t ** 2 * (1 - t),   // c
            t ** 3                  // d
        ];
    }

    let bezierCurve = (P0, P1, P2, P3, numPoints = 100) => {
        const curve = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const [a, b, c, d] = bezierBasis(t);

            const x = a * P0.x + b * P1.x + c * P2.x + d * P3.x;
            const y = a * P0.y + b * P1.y + c * P2.y + d * P3.y;

            curve.push([x, y]);
        }
        return curve;
    }

    ctx.beginPath();
    for (let i = 0; i < points.length - 3; i += 3) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const P2 = points[i + 2];
        const P3 = points[i + 3];

        const curve = bezierCurve(P0, P1, P2, P3);

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
}

export function BSpline(ctx, points) {
    let bsplineBasis = (t) => {
        return [
            (1 - t) ** 3 / 6,                           // a
            (3 * t ** 3 - 6 * t ** 2 + 4) / 6,          // b
            (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6, // c
            t ** 3 / 6                                  // d
        ];
    }

    let bsplineCurve = (P0, P1, P2, P3, numPoints = 100) => {
        const curve = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const [a, b, c, d] = bsplineBasis(t);

            const x = a * P0.x + b * P1.x + c * P2.x + d * P3.x;
            const y = a * P0.y + b * P1.y + c * P2.y + d * P3.y;

            curve.push([x, y]);
        }
        return curve;
    }

    ctx.beginPath();
    for (let i = 0; i < points.length - 3; i++) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const P2 = points[i + 2];
        const P3 = points[i + 3];

        const curve = bsplineCurve(P0, P1, P2, P3);

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
}

export function CatmullRom(ctx, points) {
    let catmullRomBasis = (t) => {
        return [
            -0.5 * t ** 3 + t ** 2 - 0.5 * t,       // a
            1.5 * t ** 3 - 2.5 * t ** 2 + 1,        // b
            -1.5 * t ** 3 + 2 * t ** 2 + 0.5 * t,   // c
            0.5 * t ** 3 - 0.5 * t ** 2             // d
        ];
    }

    let catmullRomCurve = (P0, P1, P2, P3, numPoints = 100) => {
        const curve = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const [a, b, c, d] = catmullRomBasis(t);

            const x = a * P0.x + b * P1.x + c * P2.x + d * P3.x;
            const y = a * P0.y + b * P1.y + c * P2.y + d * P3.y;

            curve.push([x, y]);
        }
        return curve;
    }

    ctx.beginPath();
    for (let i = 0; i < points.length - 3; i++) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const P2 = points[i + 2];
        const P3 = points[i + 3];

        const curve = catmullRomCurve(P0, P1, P2, P3);

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
}

export default {Linear, Hermite, Bezier, BSpline, CatmullRom};