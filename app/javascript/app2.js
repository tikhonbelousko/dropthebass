import $ from 'jquery'
import d3 from 'd3'

// Constants
const CLIENT_ID = '61b17ec61bd38e4b6cfe078e58d5a062'
const TRACK_URL = 'https://soundcloud.com/dillonfrancis/dillon-francis-kygo-coming-over-feat-james-hersey'
const DATA_SIZE = 512

// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)



// Main function
function onLoad() {
  // Update equalizer
  setInterval(() => {
    let streamData = new Uint8Array(DATA_SIZE)
    analyser.getByteFrequencyData(streamData)
  }, 20)
}