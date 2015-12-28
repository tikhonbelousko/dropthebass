import { mat4 } from 'gl-matrix'

// ---
// Init WebGL with canvas
// ---
export function initWebGL(canvas) {
  let gl = null

  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    gl.viewportWidth  = canvas.width
    gl.viewportHeight = canvas.height
  } catch(e) {}

  if (!gl) {
    console.log('Unable to initialize WebGL. Your browser may not support it.')
    gl = null
  }

  return gl
}

// ---
// Request animation frame
// ---
let requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         ((callback, element) => window.setTimeout(callback, 1000/60));
})()


// ---
// Repeat animation
// ---
export function repeatAnimation(callback) {
  callback()
  setTimeout( () => requestAnimFrame(repeatAnimation.bind(this, callback)), 1000 / 60 )
}


// ---
// Gaussian 2D
// ---
export function gaussian(mu, sigma) {
  let a = 1/(sigma * Math.sqrt(2*Math.PI))
  return ((x) => a * Math.exp(-1 * ((x-mu)*(x-mu)) / (2*sigma*sigma)))
}