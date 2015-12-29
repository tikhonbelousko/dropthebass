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

  let width = 1024
  let height = 500
  let margin = 2

  let x = d3.scale.linear().range([0, width]).domain([0, DATA_SIZE])
  let y = d3.scale.linear().range([0, height])

  let svg = d3.select('#app').append('svg')
      .attr('height', height)
      .attr('width', width)
      .style('position', 'relative')
    .append('g', 'canvas')
      .style('position', 'absolute')

  // Player
  let player =  document.getElementById('player')
  player.crossOrigin = 'Anonymous'

  let audioContext = new (window.AudioContext || window.webkitAudioContext)
  let source = audioContext.createMediaElementSource(player)
  source.connect(audioContext.destination)

  let analyser = audioContext.createAnalyser()
  analyser.fftSize = 1024

  source.connect(analyser)

  // Update equalizer
  setInterval(() => {
    let streamData = new Uint8Array(DATA_SIZE)
    analyser.getByteFrequencyData(streamData)

    let rect = svg.selectAll('rect').data(streamData)
    y.domain([0, 255])
    rect.enter()
      .append('rect')

    console.log(d3.min(streamData), d3.max(streamData))

    rect
      //.transition()
      //.duration(50)
      .attr('x', (d, i) => x(i))
      .attr('y', (d) => height - y(d))
      .attr('width', (width / DATA_SIZE) - 1)
      .attr('height', (d) => y(d))
  }, 20)

  SC.initialize({
    client_id: CLIENT_ID,
  })

  SC.get('/resolve', {url: TRACK_URL}).then((sound) => {
    if (sound.kind == 'track') {
      let streamUrl = `${sound.stream_url}?client_id=${CLIENT_ID}`
      player.setAttribute('src', streamUrl)
      player.play()
      //
    }
  })
}