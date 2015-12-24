import { mat4 } from 'gl-matrix'

// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// Variables
let canvas
let gl
let squareVerticesBuffer
let squareVerticesColorBuffer
let cubeVerticesIndexBuffer
let cubeVerticesNormalBuffer
let shaderProgram
let vertexPositionAttribute
let vertexColorAttribute
let vertexNormalAttribute

//  Animation
let cubeRotation = 0.0
let cubeXOffset = 0.0
let cubeYOffset = 0.0
let cubeZOffset = 0.0
let lastCubeUpdateTime = 0
let xIncValue = 0.2
let yIncValue = -0.4
let zIncValue = 0.3

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
      generatedColors = generatedColors.concat(c)
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

// ---
// Matrix utils
// ---
let mvMatrix = mat4.create()
let mvMatrixStack = []
let pMatrix = mat4.create()

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
  let pMatrixUniform  = gl.getUniformLocation(shaderProgram, 'uPMatrix')
  let mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
  let nMatrixUniform  = gl.getUniformLocation(shaderProgram, 'uNormalMatrix')

  let nMatrix = mat4.create()
  mat4.invert(nMatrix, mvMatrix)
  mat4.transpose(nMatrix, nMatrix)

  gl.uniformMatrix4fv(nMatrixUniform, false, nMatrix)
  gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix)
  gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix)
}

// Draw scene
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT)

  // Set perspective
  mat4.perspective(pMatrix, 45, horizAspect, 0.1, 100.0)

  // Set model matrix
  mat4.identity(mvMatrix)
  mat4.translate(mvMatrix, mvMatrix, [-0.0, 0.0, -6.0, 1.0])
  mvPushMatrix()

  // Rotation
  mat4.rotate(mvMatrix, mvMatrix, cubeRotation, [1, 0, 1])

  // Positions
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

  // Colors
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer)
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0)

  // Normals
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer)
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0)

  // Indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer)

  // Draw
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

  // Restore matrix
  mvPopMatrix()

  // Update the rotation for the next draw
  let currentTime = (new Date).getTime()
  if (lastCubeUpdateTime) {
    let delta = currentTime - lastCubeUpdateTime;

    cubeRotation += (10 * delta) / 10000.0;
  }

  lastCubeUpdateTime = currentTime;
}

// ---
// Animation
// ---
function repeatAnimation(callback) {
  callback()
  setTimeout( () => requestAnimationFrame(repeatAnimation.bind(this, callback)), 1000 / 60 )

}















