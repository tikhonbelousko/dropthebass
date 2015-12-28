import { mat4 } from 'gl-matrix'
import d3 from 'd3'
import { repeatAnimation, initWebGL, gaussian } from './utils'

// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)
window.addEventListener('resize', onResize, false)

// Constants
const CLIENT_ID = '61b17ec61bd38e4b6cfe078e58d5a062'
const TRACK_URL = 'https://soundcloud.com/dillonfrancis/disclosure-omen-dillon-francis-remix'
const DATA_SIZE = 512

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
let intensity = 0

class Face {
  static get ROW_COUNT()    { return 51 }
  static get COLUMN_COUNT() { return 51 }


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
    let g = gaussian(0, 4)
    let k = Math.max(0.1, Math.pow(Math.pow((row - (ROW_COUNT-1)/2), 2) + Math.pow((column - (COLUMN_COUNT-1)/2), 2), 1/2)) * 0.5

    mvPushMatrix()

    mat4.scale(mvMatrix, mvMatrix, [scaleX, scaleY, 1])

    mat4.translate(mvMatrix, mvMatrix, [-(COLUMN_COUNT-1) + column*2, -(ROW_COUNT-1) + row*2, g(k) * 30 * intensity])

    mat4.scale(mvMatrix, mvMatrix, [0.1 + g(k)*10*intensity, 0.1 + g(k)*10*intensity, 1])

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
  mat4.translate(mvMatrix, mvMatrix, [-0.0, -0.3, -2.0])
  mat4.rotate(mvMatrix, mvMatrix, -1, [1, 0, 0])

  for (var i in faces) {
    faces[i].draw()
  }
}

// ---
// Set up player
// ---
let analyser

function setupPlayer() {
  // Player
  let player =  document.getElementById('player')
  player.crossOrigin = 'Anonymous'

  let audioContext = new (window.AudioContext || window.webkitAudioContext)
  let source = audioContext.createMediaElementSource(player)
  source.connect(audioContext.destination)

  analyser = audioContext.createAnalyser()
  analyser.fftSize = 1024

  source.connect(analyser)

  // Connect
  SC.initialize({
    client_id: CLIENT_ID,
  })

  SC.get('/resolve', {url: TRACK_URL}).then((sound) => {
    if (sound.kind == 'track') {
      let streamUrl = `${sound.stream_url}?client_id=${CLIENT_ID}`
      player.setAttribute('src', streamUrl)
      player.play()
    }
  })
}

// ---
// Main loop
// ---
function mainLoop() {
  // Recalculate mean
  let streamData = new Uint8Array(DATA_SIZE)
  analyser.getByteFrequencyData(streamData)
  let mean = d3.mean(streamData.slice(0,DATA_SIZE))
  intensity = (Math.max(mean - 20, 0) / 255)

  // Draw scene
  drawScene()
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

    setupPlayer()
    repeatAnimation(mainLoop)
  }

  onResize()
}

// ---
// On resize
// ---
function onResize() {
  let canvas = document.getElementById('glcanvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewportWidth  = canvas.width
  gl.viewportHeight = canvas.height
}















