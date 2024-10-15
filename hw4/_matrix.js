export default class Matrix {
    // in retrospect, I should have just extended Array
    // I will try to make progress on that in a parallel class,
    // but this one should cover the requirements for hw3
    // the major difference is that it expects an array of array
    // instead of a single flat array.  
    // private -- this is some wild new syntax from ES2022
    #value
    #rows
    #cols
    #type // this is stupid but whatever -- I can use it to check for safety for arithmetic operations -- I'm only using strings to print though

    // I want the constructor to take an array of arrays because I go cross-eyed when it's all mashed together
    constructor(value = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]], isString = false) {
        const types = value.flat(Infinity).map(v => typeof v)
   
        if (isString) {
            if (types.every(t => t === 'string')) this.is = 'string'
            else throw new Error('all Matrix elements must be string')
        } else {
            if (types.every(t => t === 'number')) this.is = 'number'
            else throw new Error('all Matrix elements must be numeric')
        }
        
        this.value = value // I'm using the schmancy setter
    }

    static new(value) {
        return new Matrix(value)
    }

    // this is invaluable for chaining cause monads are cool
    // this might be too smart though ... should I have an explicit clone method?
    new(value) {
        return value ? new Matrix(value) : new Matrix(this.value)
    }

    // this is a goofy API but I didn't design JS ¯\_(ツ)_/¯
    // unclear why I would make this method N-dimensional ...
    get flat() {
        return this.value.flat(Infinity)
    }

    get value() {
        return this.#value
    }

    // I guess this method is to explicitly mutate, not to return a new instance
    set value(value) {
        if (value.flat(Infinity).some(v => this.is !== typeof v))
            throw new Error(`all Matrix elements must be ${this.is}`)
        // this falls apart with outer and inner products ... I need to check for that
        // this is a sus constructor
        // TODO: if assigning a matrix, just set the values directly
        // TODO: if a single value, make a 1x1 matrix?
        // TODO: if a list of arrays, make a matrix?
        if (value.length === value.flat(Infinity).length) {
            this.#value = [value] // this needs to be smarter
            this.#rows = value.length
            this.#cols = 1
        } else if (value.every(row => row.length === value[0].length)) {
            this.#value = value
            this.#rows = value[0].length
            this.#cols = value.length
        } else throw new Error('all nested lists must be the same length')
    }

    // alias for API completion
    get() {
        return this.value
    }

    // alias for API completion
    set(value) {
        this.value = value
        return this
    }

    get is() {
        return this.#type
    }

    set is(type) {
        this.#type = type
    }

    // printing is important 😤
    // I have to transpose out of column major format ... how complicted
    // this is a hideous amount of statements for real
    toString() {
        const values = this.#value.map(cols => cols.map(v => v.toFixed(2)))
        const max_length = Math.max(...values.flat(Infinity).map(v => v.length))
        const padded = values.map(cols => cols.map(v => v.padStart(max_length, ' ')))
        return new Matrix(padded, true).transpose().value.map(row => row.join('\t')).join('\n')
    }

    // dimensions for fun
    get dims() {
        return [this.#rows, this.#cols]
    }

    // having an instance version of multiply seems like it would be useful
    // should this mutate or return a new instance generally?
    multiply(matrix) {
        return Matrix.multiply(this, matrix)
    }

    // column major format has columns first, honestly it's making me dizzy
    get_position(i = 0, j = 0) {
        if (![i, j].every(v => typeof v === 'number'))
            throw new Error('Matrix position i, j must be numeric')
        return this.#value[i][j]
    }

    set_position(i = 0, j = 0, v = 0) {
        if (![i, j].every(v => typeof v === 'number'))
            throw new Error('Matrix position i, j must be numeric')
        if (this.is !== typeof v)
            throw new Error(`all Matrix elements must be ${this.is}`)
        this.#value[i][j] = v
        return this
    }

    // should this mutate or return a new instance generally?
    transpose() {
        const [rows, cols] = this.dims
        // this changes the original value -- not sure if I should do that
        this.value = Array.from({length: rows}, (_, i) => { //rows
            return Array.from({length: cols}, (_, j) => { //columns
                return this.get_position(j, i)
            })
        })
        return this
    }

    // 1  0  0  x 
    // 0  1  0  y
    // 0  0  1  z
    // 0  0  0  1
    translate(x = 0, y = 0, z = 0) {
        if (![x, y, z].every(v => typeof v === 'number'))
            throw new Error('Matrix translation x, y, z must be numeric')
        let translated = Matrix.identity()
            .set_position(3,0,x)
            .set_position(3,1,y)
            .set_position(3,2,z)

        this.value = this.multiply(translated).value
        return this
    }
    
    #degrees_to_radians(degrees) {
        return degrees * (Math.PI / 180)
    }

    // 1       0       0  0
    // 0  cos(Θ) -sin(Θ)  0
    // 0  sin(Θ)  cos(Θ)  0
    // 0       0       0  1
    rotateX(theta){
        if (typeof theta !== 'number')
            throw new Error('Matrix rotation theta must be numeric')
        theta = this.#degrees_to_radians(theta)
        let rotated = Matrix.identity()
            .set_position(1,1,Math.cos(theta))
            .set_position(1,2,Math.sin(theta))
            .set_position(2,1,-Math.sin(theta))
            .set_position(2,2,Math.cos(theta))
        
        this.value = this.multiply(rotated).value
        return this
    }
    
    // cos(Θ)   0   sin(Θ)   0
    //      0   1        0   0
    //-sin(Θ)   0   cos(Θ)   0
    //      0   0        0   1
    rotateY(theta) {
        if (typeof theta !== 'number')
            throw new Error('Matrix rotation theta must be numeric')
        theta = this.#degrees_to_radians(theta)
        let rotated = Matrix.identity()
            .set_position(0,0,Math.cos(theta))
            .set_position(0,2,-Math.sin(theta))
            .set_position(2,0,Math.sin(theta))
            .set_position(2,2,Math.cos(theta))
        
        this.value = this.multiply(rotated).value
        return this
    }
    
    // cos(Θ)   -sin(Θ)   0   0
    // sin(Θ)    cos(Θ)   0   0
    //      0         0   1   0
    //      0         0   0   1
    rotateZ(theta) {
        if (typeof theta !== 'number')
            throw new Error('Matrix rotation theta must be numeric')
        theta = this.#degrees_to_radians(theta)
        let rotated = Matrix.identity()
            .set_position(0,0,Math.cos(theta))
            .set_position(0,1,Math.sin(theta))
            .set_position(1,0,-Math.sin(theta))
            .set_position(1,1,Math.cos(theta))
        
        this.value = this.multiply(rotated).value
        return this
    }
    
    // x  0  0  0
    // 0  y  0  0
    // 0  0  z  0
    // 0  0  0  1
    scale(x,y,z) {
        if (![x, y, z].every(v => typeof v === 'number'))
            throw new Error('Matrix scale x, y, z must be numeric')
        let scaled = Matrix.identity()
            .set_position(0,0,x)
            .set_position(1,1,y)
            .set_position(2,2,z)
        
        this.value = this.multiply(scaled).value
        return this
    }
    
    // 1  0  0  0
    // 0  1  0  0
    // 0  0  1  0
    // x  y  z  1
    perspective(x,y,z) {
        if (![x, y, z].every(v => typeof v === 'number'))
            throw new Error('Matrix perspective x, y, z must be numeric')
        let perspective = Matrix.identity()
            .set_position(0,3,x)
            .set_position(1,3,y)
            .set_position(2,3,z)
        
        this.value = this.multiply(perspective).value
        return this
    }

    // ax+by+cz+dw          a   b   c   d        x
    // ex+fy+gz+hw    =     e   f   g   h    •   y
    // ix+jy+kz+lw          i   j   k   l        z
    // mx+ny+oz+pw          m   n   o   p        w
    transform(vector) {
        if (!vector instanceof Array)
            throw new Error('Matrix transform vector must be an array')
        if (vector.length !== this.#cols)
            throw new Error('Matrix transform vector must match the number of rows')
        this.value = this.multiply(Matrix.new(vector)).value
        return this
    }

    // I'm adding some convenience methods to initialize my transforms

    // 0  0  0  0
    // 0  0  0  0
    // 0  0  0  0
    // 0  0  0  0
    static zeroes = (rows, cols) => {
        return new Matrix(
            Array.from({length: cols}, () => Array.from({length: rows}, () => 0))
        )
    }

    // 1  1  1  1
    // 1  1  1  1
    // 1  1  1  1
    // 1  1  1  1
    static ones = (rows, cols) => {
        return new Matrix(
            Array.from({length: cols}, () => Array.from({length: rows}, () => 1))
        )
    }

    // 1  0  0  0
    // 0  1  0  0
    // 0  0  1  0
    // 0  0  0  1
    static identity = () => {
        // the default constructor is the identity matrix, yay
        return new Matrix()
    }

    // aA+bE+cI+dM  aB+bF+cJ+dN  aC+bG+cK+dO  aD+bH+cL+dP         a b c d       A B C D
    // eA+fE+gI+hM  eB+fF+gJ+hN  eC+fG+gK+hO  eD+fH+gL+hP    =    e f g h   *   E F G H
    // iA+jE+kI+lM  iB+jF+kJ+lN  iC+jG+kK+lO  iD+jH+kL+lP         i j k l       I J K L
    // mA+nE+oI+pM  mB+nF+oJ+pN  mC+nG+oK+pO  mD+nH+oL+pP         m n o p       M N O P
    static multiply = (matrix_a, matrix_b) => {
        if (![matrix_a, matrix_b].every(m => m instanceof Matrix))
            throw new Error('Matrix multiplication requires two Matrix instances')
        if (![matrix_a, matrix_b].every(m => m.is === 'number'))
            throw new Error('Matrix A and B must both be numeric for multiplication')

        const [a_rows, a_cols, b_rows, b_cols] = [].concat(matrix_a.dims, matrix_b.dims)
        if (a_cols !== b_rows)
            throw new Error('Matrix A columns must match Matrix B rows for multiplication')

        const product = Matrix.zeroes(a_rows, b_cols)

        // man this was a lot harder than it looks
        matrix_a.transpose().forEach((a_row, i) => {
            matrix_b.forEach((b_col, j) => {
                const val = a_row.reduce((sum, a, k) => sum + (a * b_col[k]), 0)
                product.set_position(j, i, val)
            })
        })

        return product
    }

    // I should have just exteneded Array...
    forEach(...x) {
        return this.value.forEach(...x)
    }

    reduce(...x) {
        return this.value.reduce(...x)
    }

    map(...x) {
        return this.value.map(...x)
    }
}