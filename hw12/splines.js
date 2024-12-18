export function CatmullRom(points, numPoints = 10) {
    const result = [];

    // Need at least 4 points for Catmull-Rom
    if (points.length < 12) { // 4 points * 3 coordinates
        // If not enough points, just return the original points
        return new Float32Array(points);
    }

    for (let i = 0; i < points.length - 9; i += 3) {
        // Get four points p0, p1, p2, p3 (each point has x,y,z)
        const p0 = [points[i], points[i+1], points[i+2]];
        const p1 = [points[i+3], points[i+4], points[i+5]];
        const p2 = [points[i+6], points[i+7], points[i+8]];
        const p3 = [points[i+9], points[i+10], points[i+11]];

        // Interpolate between p1 and p2
        for (let t = 0; t < 1; t += 1 / numPoints) {
            const t2 = t * t;
            const t3 = t2 * t;

            // Catmull-Rom matrix calculation for each coordinate
            for (let coord = 0; coord < 3; coord++) {
                const v = 0.5 * (
                    (-p0[coord] + 3*p1[coord] - 3*p2[coord] + p3[coord]) * t3 +
                    (2*p0[coord] - 5*p1[coord] + 4*p2[coord] - p3[coord]) * t2 +
                    (-p0[coord] + p2[coord]) * t +
                    2 * p1[coord]
                );
                result.push(v);
            }
        }
    }

    // Add the last point
    const lastIndex = points.length - 3;
    result.push(points[lastIndex], points[lastIndex+1], points[lastIndex+2]);

    return new Float32Array(result);
}

export default {CatmullRom};