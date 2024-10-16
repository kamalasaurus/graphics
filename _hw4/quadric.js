// the quadric equation is:
// ax2 + by2 + cz2 + dyz + ezx + fxy + gx + hy + iz + j ≤ 0

// the quadric format is as such:
// a	f	e	g
// 0	b	d	h
// 0	0	c	i
// 0	0	0	j

// since we're doing column-major format, the matrix is as such:
// a	0	0	0
// f	b	0	0
// e	d	c	0
// g	h	i	j

// x2 + y2 + z2 - 1 ≤ 0
export const sphere = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1
]

// y2 + z2 + x ≤ 0
export const xParaboloid = [
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0
]

// x2 + z2 + y ≤ 0
export const yParaboloid = [
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 1, 0, 0
]

// x2 + y2 + z ≤ 0
export const zParaboloid = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0
]

// x2 - 1 ≤ 0
export const xSlab = [
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, -1
]

// y2 - 1 ≤ 0
export const ySlab = [
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, -1
]

// z2 - 1 ≤ 0
export const zSlab = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1
]

// y2 + z2 - 1 ≤ 0
export const xCylinder = [
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1
]

// x2 + z2 - 1 ≤ 0
export const yCylinder = [
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1
]

// x2 + y2 - 1 ≤ 0
export const zCylinder = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, -1
]

// -1 ≤ 0
export const everywhere = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, -1
]

const Quadric = {
    sphere,
    xParaboloid,
    yParaboloid,
    zParaboloid,
    xSlab,
    ySlab,
    zSlab,
    xCylinder,
    yCylinder,
    zCylinder,
    everywhere
}

export default Quadric