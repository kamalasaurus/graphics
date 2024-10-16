// I reimplemented this as flat functions so it works with quadric_objects.html
// I have to transpose everythign because I'm using column-major format
// But my brain thinks in row-major format

export const identity = () => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

export const translation = (x,y,z) => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]
}

export const rotationX = (t) => {
    return [
        1, 0, 0, 0,
        0, Math.cos(t), -Math.sin(t), 0,
        0, Math.sin(t), Math.cos(t), 0,
        0, 0, 0, 1
    ]
}

// There was a typo here in the example I think!
export const rotationY = (t) => {
    return [
        Math.cos(t), 0, Math.sin(t), 0,
        0, 1, 0, 0,
        -Math.sin(t), 0, Math.cos(t), 0,
        0, 0, 0, 1
    ]
}

export const rotationZ = (t) => {
    return [
        Math.cos(t), -Math.sin(t), 0, 0,
        Math.sin(t), Math.cos(t), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

export const scale = (x,y,z) => {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]
}

export const perspective = (x,y,z) => {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1   
    ]
}

export const multiply = (a,b) => {
    // I had to do this manually because it's hard for me to think in column major
    // and it seemed to be blowing up when I tried using the loops
    return [
        a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
        a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
        a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
        a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
        a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
        a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
        a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
        a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
        a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
        a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
        a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
        a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
        a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
        a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
        a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
        a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15],
    ]
}

export const transpose = (m) => {
    // just doing this manually again because I can't think in column major
    // format
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ]
}

export const toString = (m) => {
    transpose(m.reduce((acc, el, i) => {
        if (i % 4 === 0) {
            acc.push([])
        }
        acc[acc.length - 1].push(el)
        return acc
    })).map(row => row.join('\t')).join('\n')
}

const Matrix = {
    identity,
    translation,
    rotationX,
    rotationY,
    rotationZ,
    scale,
    perspective,
    multiply,
    transpose,
    toString,
}

export default Matrix