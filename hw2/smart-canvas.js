class SmartCanvas extends HTMLElement {
  shadertypes = {
    vert: () => this.gl.VERTEX_SHADER,
    frag: () => this.gl.FRAGMENT_SHADER
  }

  // should these be instance variables instead of class??? is this valid syntax?
  resizeevent = new window.Event('resize')
  refreshevent = new window.Event('refresh')
  dpr = window.devicePixelRatio

  constructor({scripts, shaders} = {}) {
    super()

    this.attachShadow({mode: 'open'});
    this.canvas = document.createElement('canvas');
    this.shadowRoot.appendChild(this.canvas);

    this.style.setProperty('display', 'block')
    this.style.setProperty('overflow', 'hidden')
    this.style.setProperty('box-sizing', 'border-box')
    this.style.setProperty('width', '100%')
    this.style.setProperty('height', '100%')

    this.canvas.style.setProperty('width', '100%')
    this.canvas.style.setProperty('height', '100%')

    this._gl = this.canvas.getContext('webgl2')
    if (!this._gl) console.error('webgl not available in this browser')
    this._program = this._gl.createProgram()

    this.rect = this.canvas.getBoundingClientRect()
    this.cursor = [0,0,0]

    this._resizeObserver = new window.ResizeObserver(this.resize.bind(this))
    this._resizeObserver.observe(this)

    if (scripts) this.setAttribute('data-scripts', scripts)
    if (shaders) this.setAttribute('data-shaders', shaders)
  }

  get gl() {
    return this._gl
  }

  get program() {
    return this._program
  }

  connectedCallback() {
    Promise.all([
      Promise.all(this.getData('scripts').map(this.getScript.bind(this))),
      Promise.all(this.getData('shaders').map(this.getShader.bind(this))),
    ])
    .then(([scripts, shaders]) => {
      this.linkProgram.call(this, shaders)
      scripts.forEach(Handler => {
        const handler = new Handler(this.gl, this.program)
        this.addEventListener('resize', () => handler.resize(this.gl))
        this.addEventListener('refresh', () => handler.loop(this.gl, this.cursor))
      })
      this.resize()
      this.refresh()
      return true
    })
    .catch(error => {
      console.error('Error initializing shaders or scripts:', error);
    })
  }

  async getScript(src) {
    return import(src).then(({default: Handler}) => Handler)
  }

  getData(type) {
    const datastr = this.dataset[type] || ''
    return datastr.split(',').map(s => s.trim())
  }

  async getShader(src) {
    const type = this.getShaderType(src)
    const text = await window.fetch(src).then(resp => resp.text())
    const shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, text)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      console.error(`ERROR compiling ${src} shader`, this.gl.getShaderInfoLog(shader))
    return shader
  }

  getShaderType(src) {
    return this.shadertypes[src.split('.').pop()]()
  }

  linkProgram(shaders) {
    shaders.forEach(this.gl.attachShader.bind(this.gl, this.program))
    this.gl.linkProgram(this.program)
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
      console.error('ERROR linking program', this.gl.getProgramInfoLog(this.program))
    this.gl.validateProgram(this.program)
    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS))
      console.error('ERROR validating program', this.gl.getProgramInfoLog(this.program))
    return this.program
  }

  getCursor() {
    this.rect = this.canvas.getBoundingClientRect()
    this.cursor = [0,0,0]

    let setCursor = (e, z) => {
      this.cursor = [
        (e.clientX - this.rect.left) / this.canvas.width * 2 - 1,
        1 - (e.clientY - this.rect.top) / this.canvas.height * 2,
        z !== undefined ? z : this.cursor[2]
      ]
    }

    this.canvas.onmousedown = e => setCursor(e, 1);
    this.canvas.onmousemove = e => setCursor(e,  );
    this.canvas.onmouseup   = e => setCursor(e, 0);
  }

  refresh() {
    this.dispatchEvent(this.refreshevent)
    setInterval(this.refresh.bind(this), 30)
  }

  resize() {
    let {width, height} = this.getBoundingClientRect()

    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.gl.viewport(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
    this.getCursor()

    this.dispatchEvent(this.resizeevent)
  }
}

window.customElements.define('smart-canvas', SmartCanvas)

class RenderContext {
  constructor(gl, program) {
    this.gl = gl
    this.program = program
    gl.enable(gl.DEPTH_TEST) // only the forward most Z index is drawn
    gl.depthFunc(gl.LEQUAL) // if the Z index is less than or equal to the current Z index, draw
    // gl.enable(gl.CULL_FACE) // don't waste math on the back face gl.cullFace(gl.BACK)
    // gl.frontFace(gl.CCW) // since we rotate counterclockwise? Optimization?
    // gl.cullFace(gl.BACK) // can also cull gl.FRONT for trolling -- back is default, and explicit here
    this.clear(0.0, 0.0, 0.0, 0.0)
  }

  clear(...colorPoints) {
    this.gl.clearColor(...colorPoints)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  loop(gl, cursor) {}

  resize(gl) {}
}

export { SmartCanvas, RenderContext }
