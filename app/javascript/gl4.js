// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// Variables
let canvas
let gl
let squareVerticesBuffer
let squareVerticesColorBuffer
let mvMatrix
let shaderProgram
let vertexPositionAttribute
let vertexColorAttribute
let perspectiveMatrix

//  Animation
var squareRotation = 0.0
var squareXOffset = 0.0
var squareYOffset = 0.0
var squareZOffset = 0.0
var lastSquareUpdateTime = 0
var xIncValue = 0.2
var yIncValue = -0.4
var zIncValue = 0.3

// Constants
let horizAspect = 480.0/640.0


// Main function
function onLoad() {
  canvas = document.getElementById('glcanvas')
  gl = initWebGL(canvas)

  if (gl) {
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    initShaders()
    initBuffers()

    setInterval(drawScene, 15)
  }
}

// Init WebGL
function initWebGL(canvas) {
  gl = null

  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  } catch(e) {}

  if (!gl) {
    console.log('Unable to initialize WebGL. Your browser may not support it.')
    gl = null
  }

  return gl
}


// Init shaders
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

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  gl.enableVertexAttribArray(vertexPositionAttribute)

  vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
  gl.enableVertexAttribArray(vertexColorAttribute)
}

// Get shader from HTML
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


// Init buffers
function initBuffers() {
  squareVerticesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)

  let vertices = [
    1.0,   1.0,  0.0,
    -1.0,  1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  let colors = [
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  0.0,  0.0,  1.0,    // red
    0.0,  1.0,  0.0,  1.0,    // green
    0.0,  0.0,  1.0,  1.0     // blue
  ]

  squareVerticesColorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
}


// Draw scene
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT)
  perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0)

  loadIdentity()
  mvTranslate([-0.0, 0.0, -6.0])

  // Save current matrix
  mvPushMatrix()
  mvRotate(squareRotation, [1, 0, 1])
  mvTranslate([squareXOffset, squareYOffset, squareZOffset])

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer)
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0)

  setMatrixUniforms()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  // Restore the original matrix
  mvPopMatrix()

  // Update the rotation for the next draw, if it's time to do so.
  let currentTime = (new Date).getTime()
  if (lastSquareUpdateTime) {
    var delta = currentTime - lastSquareUpdateTime

    squareRotation += (30 * delta) / 1000.0
    squareXOffset += xIncValue * ((30 * delta) / 1000.0)
    squareYOffset += yIncValue * ((30 * delta) / 1000.0)
    squareZOffset += zIncValue * ((30 * delta) / 1000.0)

    if (Math.abs(squareYOffset) > 2.5) {
      xIncValue = -xIncValue
      yIncValue = -yIncValue
      zIncValue = -zIncValue
    }
  }

  lastSquareUpdateTime = currentTime
}


// ---
// Matrix utils
// ---
function loadIdentity() {
  mvMatrix = Matrix.I(4)
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m)
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4())
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()))

  var mvUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()))
}

var mvMatrixStack = []
function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup())
    mvMatrix = m.dup()
  } else {
    mvMatrixStack.push(mvMatrix.dup())
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.")
  }

  mvMatrix = mvMatrixStack.pop()
  return mvMatrix
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0

  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4()
  multMatrix(m)
}
















