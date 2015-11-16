import $ from 'jquery'

// Constants
const CLIENT_ID = '61b17ec61bd38e4b6cfe078e58d5a062'
const TRACK_URL = 'https://soundcloud.com/odesza/say_my_name'

// On Load
document.addEventListener('DOMContentLoaded', onLoad, false)

// Main function
function onLoad() {
  // Player
  let player =  document.getElementById('player')
  player.crossOrigin = 'Anonymous'

  let audioContext = new (window.AudioContext || window.webkitAudioContext)
  let source = audioContext.createMediaElementSource(player)
  source.connect(audioContext.destination)

  let analyser = audioContext.createAnalyser()

  source.connect(analyser)

  // Update equalizer
  setInterval(() => {
    let streamData = new Uint8Array(128)
    analyser.getByteFrequencyData(streamData)
  }, 100)

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