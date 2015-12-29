import { mat4 } from 'gl-matrix'
import { repeatAnimation, initWebGL } from './utils'

// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// Variables
let gl

// ---
// Get shader from HTML
// ---
function getShader(gl, id) {
  let shaderScript, theSource, currentChild, shader

  shaderScript = document.getElementById(id)
  if (!shaderScript) return null

  // Read sorce
  theSource = ''
  currentChild = shaderScript.firstChild
  while (currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent
    }
    currentChild = currentChild.nextSibling
  }

  // Set type
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  }
  else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER)
  }
  else {
    return null
  }


  gl.shaderSource(shader, theSource)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    return null
  }

  return shader
}

// ---
// Init shaders
// ---
let shaderProgram
function initShaders() {
  let vertexShader = getShader(gl, 'shader-vs')
  let fragmentShader = getShader(gl, 'shader-fs')

  shaderProgram = gl.createProgram()
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
}


// ---
// Matrix utils
// ---
let mvMatrixStack = []
let mvMatrix = mat4.create()
let pMatrix  = mat4.create()

function mvPushMatrix() {
    let copy = mat4.create()
    mat4.copy(copy, mvMatrix)
    mvMatrixStack.push(copy)
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!"
    }
    mvMatrix = mvMatrixStack.pop()
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}


// ---
// Init buffers
// ---
let faceVertexPositionBuffer
let faceVertexColorBuffer
let faceVertexIndexBuffer

function initBuffers() {

  // Vertices
  let vertices = [
    -1.0,  1.0,  0.0,
     1.0,  1.0,  0.0,
     1.0, -1.0,  0.0,
    -1.0, -1.0,  0.0
  ]

  faceVertexPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  faceVertexPositionBuffer.itemSize = 3
  faceVertexPositionBuffer.numItems = 4

  // Colors
  let colors = [
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0
  ]

  faceVertexColorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  faceVertexColorBuffer.itemSize = 4
  faceVertexColorBuffer.numItems = 4

  // Indices
  let indices = [ 0, 1, 2, 0, 2, 3 ]

  faceVertexIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  faceVertexIndexBuffer.itemSize = 1
  faceVertexIndexBuffer.numItems = 6
}


// ---
// Draw Face
// ---
function drawFace() {
  // Positions
  gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, faceVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

  // Colors
  gl.bindBuffer(gl.ARRAY_BUFFER, faceVertexColorBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, faceVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

  // Indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndexBuffer)

  // Draw
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, faceVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
}

// ---
// Class for Face in the grid
// ---
class Face {
  static get ROW_COUNT()    { return 31 }
  static get COLUMN_COUNT() { return 31 }

  get scaleX() {
    return 1/this.constructor.COLUMN_COUNT
  }

  get scaleY() {
    return 1/this.constructor.ROW_COUNT
  }

  constructor(row, column) {
    this.row = row
    this.column = column
  }

  draw() {
    let {scaleX, scaleY, row, column} = this
    let {ROW_COUNT, COLUMN_COUNT} = this.constructor
    let k = Math.max(2, Math.pow(Math.pow((row - (ROW_COUNT-1)/2), 2) + Math.pow((column - (COLUMN_COUNT-1)/2), 2), 1/2)) * 0.5

    mvPushMatrix()

    mat4.scale(mvMatrix, mvMatrix, [scaleX, scaleY, 1])
    mat4.translate(mvMatrix, mvMatrix, [-(COLUMN_COUNT-1) + column*2, -(ROW_COUNT-1) + row*2, 2/k ])
    mat4.scale(mvMatrix, mvMatrix, [1/k, 1/k, 1])

    drawFace()
    mvPopMatrix()
  }

}

// ---
// Init world objects
// ---
let faces = []
function initWorldObjects() {
  let facesNum = Face.COLUMN_COUNT * Face.ROW_COUNT

  for (let i = 0; i < facesNum; ++i) {
    let div = Math.floor(i / Face.COLUMN_COUNT)
    let mod = i % Face.COLUMN_COUNT
    faces.push(new Face(div, mod))
  }
}

// ---
// Draw scene
// ---
function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  mat4.identity(mvMatrix)
  mat4.translate(mvMatrix, mvMatrix, [-0.0, -0.3, -3.0])
  mat4.rotate(mvMatrix, mvMatrix, -1, [1, 0, 0])

  for (var i in faces) {
    faces[i].draw()
  }
}

// ---
// Main function
// ---
function onLoad() {
  let canvas = document.getElementById('glcanvas')
  gl = initWebGL(canvas)

  if (gl) {
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    initShaders()
    initBuffers()
    initWorldObjects()

    repeatAnimation(drawScene)
  }
}
















