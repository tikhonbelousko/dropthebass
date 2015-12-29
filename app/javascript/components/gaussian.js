import React from 'react'
import { mat4 } from 'gl-matrix'
import { repeatAnimation, initWebGL, gaussian } from '../utils'
import shaderVx from '../shaders/shader-vx'
import shaderFg from '../shaders/shader-fg'


export default class Gaussian extends React.Component {

  // ---
  // Set up variables
  // ---
  constructor(props) {
    super(props)

    // Globals
    this.gl = null
    this.shaderProgram = null

    // Matrices
    this.mvMatrixStack = []
    this.mvMatrix = mat4.create()
    this.pMatrix  = mat4.create()

    // Buffers
    this.faceVertexPositionBuffer = null
    this.faceVertexColorBuffer    = null
    this.faceVertexIndexBuffer    = null

    // Parameters
    this.cols = 51
    this.rows = 51
  }


  // ---
  // Init WebGL
  // ---
  componentDidMount() {
    let canvas = this.refs.canvas

    this.gl = initWebGL(canvas)
    let gl = this.gl

    if (gl) {
      gl.clearColor(0.0,0.0,0.0,1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      this.initShaders()
      this.initBuffers()

      repeatAnimation(this.mainLoop.bind(this))
    }

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this), false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize.bind(this), false)
  }


  // ---
  // Shaders
  // ---
  initShaders() {
    let gl = this.gl

    let vertexShader = this.getShader(shaderVx, gl.VERTEX_SHADER)
    let fragmentShader = this.getShader(shaderFg, gl.FRAGMENT_SHADER)

    let shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log('Unable to initialize the shader program.')
    }

    gl.useProgram(shaderProgram)

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)

    shaderProgram.pMatrixUniform  = gl.getUniformLocation(shaderProgram, 'uPMatrix')
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')

    this.shaderProgram = shaderProgram
  }

  getShader(source, type) {
    let gl     = this.gl
    let shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      return null
    }

    return shader
  }


  // ---
  // Initialize buffers
  // ---
  initBuffers() {
    let gl = this.gl

    // Vertices
    let vertices = [
      -1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
       1.0, -1.0,  0.0,
      -1.0, -1.0,  0.0
    ]

    let faceVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    faceVertexPositionBuffer.itemSize = 3
    faceVertexPositionBuffer.numItems = 4
    this.faceVertexPositionBuffer = faceVertexPositionBuffer

    // Colors
    let colors = [
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ]

    let faceVertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexColorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    faceVertexColorBuffer.itemSize = 4
    faceVertexColorBuffer.numItems = 4
    this.faceVertexColorBuffer = faceVertexColorBuffer

    // Indices
    let indices = [ 0, 1, 2, 0, 2, 3 ]

    let faceVertexIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    faceVertexIndexBuffer.itemSize = 1
    faceVertexIndexBuffer.numItems = 6
    this.faceVertexIndexBuffer = faceVertexIndexBuffer
  }

  // ---
  // Draw scene
  // ---
  drawScene() {
    let { gl, rows, cols, pMatrix, mvMatrix } = this

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    mat4.identity(mvMatrix)
    mat4.translate(mvMatrix, mvMatrix, [-0.0, -0.3, -2.0])
    mat4.rotate(mvMatrix, mvMatrix, -1, [1, 0, 0])

    for (let r = 0; r < rows; ++r) {
      for (let c = 0; c < cols; ++c) {
        this.drawFace(r, c)
      }
    }
  }

  drawFace(r, c) {
    let { gl, rows, cols, pMatrix, mvMatrix } = this
    let { pow, max } = Math
    let g = gaussian(0, 4)
    let k = Math.max(0.1, Math.pow(Math.pow((r - (rows-1)/2), 2) + Math.pow((c - (cols-1)/2), 2), 1/2)) * 0.5
    let intensity = this.props.intensity

    this.mvPushMatrix()

    mat4.scale(mvMatrix, mvMatrix, [1/cols, 1/rows, 1])
    mat4.translate(mvMatrix, mvMatrix, [-(cols-1) + c*2, -(rows-1) + r*2, g(k) * 30 * intensity])
    mat4.scale(mvMatrix, mvMatrix, [0.1 + g(k)*10*intensity, 0.1 + g(k)*10*intensity, 1])

    this.drawBuffer()
    this.mvPopMatrix()

  }

  drawBuffer() {
    let { gl, faceVertexPositionBuffer, faceVertexColorBuffer, faceVertexIndexBuffer, shaderProgram } = this

    // Positions
    gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, faceVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

    // Colors
    gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, faceVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndexBuffer)

    // Draw
    this.setMatrixUniforms()
    gl.drawElements(gl.TRIANGLES, faceVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
  }

  // ---
  // Main loop
  // ---
  mainLoop() {
    this.drawScene()
  }

  // ---
  // Matrix operations
  // ---
  mvPushMatrix() {
    let { mvMatrix, mvMatrixStack } = this
    let copy = mat4.create()
    mat4.copy(copy, mvMatrix)
    mvMatrixStack.push(copy)
  }

  mvPopMatrix() {
    let { mvMatrixStack } = this
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!"
    }
    this.mvMatrix = mvMatrixStack.pop()
  }

  setMatrixUniforms() {
    let { gl, shaderProgram, pMatrix, mvMatrix } = this
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
  }

  // ---
  // Resize
  // ---
  onResize() {
    let canvas = this.refs.canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.gl.viewportWidth  = canvas.width
    this.gl.viewportHeight = canvas.height
  }

  // ---
  // Render
  // ---
  render() {
    return (
      <canvas ref='canvas' className='gaussian'>
      </canvas>
    )
  }
}

Gaussian.defaultProps = {
  intensity: 0.2
}