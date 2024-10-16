// I reimplemented this as flat functions so it works with quadric_objects.html
// I have to transpose everythign because I'm using column-major format
// But my brain thinks in row-major format

export const translation = (x,y,z) => {
    return transpose([
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ])
}

export const rotationX = (t) => {
    return transpose([
        [1, 0, 0, 0],
        [0, Math.cos(t), -Math.sin(t), 0],
        [0, Math.sin(t), Math.cos(t), 0],
        [0, 0, 0, 1]
    ])
}

export const rotationY = (t) => {
    return transpose([
        [Math.cos(t), 0, Math.sin(t), 0],
        [0, 1, 0, 0],
        [-Math.sin(t), 0, Math.cos(t), 0],
        [0, 0, 0, 1]
    ])
}

export const rotationZ = (t) => {
    return transpose([
        [Math.cos(t), -Math.sin(t), 0, 0],
        [Math.sin(t), Math.cos(t), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ])
}

export const scale = (x,y,z) => {
    return transpose([
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1]
    ])
}

export const multiply = (a,b) => {
    return a.map((row, i) => {
        return row.map((_, j) => {
            return row.reduce((acc, _, k) => {
                return acc + a[i][k] * b[k][j]
            }, 0)
        })
    })
}

export const transpose = (m) => {
    // m[0] just generates a new array w/ the same number of elements
    return m[0].map((_, i) => m.map(row => row[i]))
}

export const value = (m) => {
    return m.flat(Infinity)
}

export const toString = (m) => {
    return transpose(m).map(row => row.join('\t')).join('\n')
}

export const identity = () => {
    return transpose([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ])
}

const Matrix = {
    translation,
    rotationX,
    rotationY,
    rotationZ,
    scale,
    multiply,
    transpose,
    value,
    toString,
    identity
}

export default Matrix