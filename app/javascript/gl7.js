// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// Variables
let canvas
let gl
let squareVerticesBuffer
let squareVerticesColorBuffer
let cubeVerticesIndexBuffer
let cubeVerticesNormalBuffer
let mvMatrix
let shaderProgram
let vertexPositionAttribute
let vertexColorAttribute
let vertexNormalAttribute
let perspectiveMatrix

//  Animation
let cubeRotation = 0.0
let lastCubeUpdateTime = 0


// Constants
let horizAspect = 640.0/480.0


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

    // setInterval(drawScene, 15)
    repeatAnimation(drawScene)
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

  vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal')
  gl.enableVertexAttribArray(vertexNormalAttribute)
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

  // ---
  // Vertices
  // ---
  let vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ]
  squareVerticesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // ---
  // Colors
  // ---
  let colors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
  ];

  let generatedColors = [];

  for (let j=0; j<6; j++) {
    let c = colors[j];

    for (let i=0; i<4; i++) {
      generatedColors = generatedColors.concat(c);
    }
  }

  squareVerticesColorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW)


  // ---
  // Indices
  // ---
  let cubeVertexIndices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ]

  cubeVerticesIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)


  // ---
  // Normals
  // ---
  let vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ]

  cubeVerticesNormalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW)
}


// Draw scene
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT)
  perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0)

  loadIdentity()
  mvTranslate([-0.0, 0.0, -6.0])

  // Save current matrix
  mvPushMatrix()
  mvRotate(cubeRotation, [1, 0, 1])

  // Positions
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

  // Colors
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer)
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0)

  // Normals
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer)
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0)

  // Draw
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer)
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

  // Restore matrix
  mvPopMatrix()

  // Update the rotation for the next draw
  let currentTime = (new Date).getTime();
  if (lastCubeUpdateTime) {
    let delta = currentTime - lastCubeUpdateTime;

    cubeRotation += (30 * delta) / 1000.0;
  }

  lastCubeUpdateTime = currentTime;
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
  let pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()))

  let mvUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()))

  let normalMatrix = mvMatrix.inverse()
  normalMatrix = normalMatrix.transpose()
  let nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix")
  gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()))
}

let mvMatrixStack = []
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
  let inRadians = angle * Math.PI / 180.0

  let m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4()
  multMatrix(m)
}


// ---
// Animation
// ---
function repeatAnimation(callback) {
  callback()
  requestAnimationFrame(repeatAnimation.bind(this, callback))
}