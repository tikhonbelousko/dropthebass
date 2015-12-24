// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// WebGL context
let gl;

// Main function
function onLoad() {
  let canvas = document.getElementById('glcanvas')
  gl = initWebGL(canvas)

  if (gl) {
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }
}

// Init WebGL
function initWebGL(canvas) {
  gl = null;

  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  } catch(e) {}

  if (!gl) {
    console.log('Unable to initialize WebGL. Your browser may not support it.')
    gl = null;
  }

  return gl;
}

