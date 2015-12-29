import React from 'react'
import Gaussian from './gaussian'
import Player from './player'
import Modal from './modal'
import { connect } from 'react-redux'
import { fetchSong } from '../actions'
import d3 from 'd3'


class App extends React.Component {

  constructor(props) {
    super(props)
    this.analyser = null
    this.state = {intensity: 0, openModal: false}
  }

  componentDidMount() {
    // let TRACK_URL = 'https://soundcloud.com/dillonfrancis/disclosure-omen-dillon-francis-remix'
    let TRACK_URL = 'https://soundcloud.com/lyonsounds/g-eazy-me-myself-and-i'
    this.props.dispatch(fetchSong(TRACK_URL))
    this.tick()
  }

  componentWillReceiveProps(newProps) {
    let { song } = newProps
    if (song.data) {
      this.setupPlayer(song.data.song_url)
    }
  }

  setupPlayer(songUrl) {
    let player =  this.refs.player
    player.crossOrigin = 'Anonymous'

    let audioContext = new (window.AudioContext || window.webkitAudioContext)
    let source = audioContext.createMediaElementSource(player)
    source.connect(audioContext.destination)

    this.analyser = audioContext.createAnalyser()
    this.analyser.fftSize = 1024

    source.connect(this.analyser)
  }

  tick() {
    const DATA_SIZE = 512
    let intensity = 0

    if (this.analyser) {
      let streamData = new Uint8Array(DATA_SIZE)
      this.analyser.getByteFrequencyData(streamData)
      let mean = d3.mean(streamData.slice(0,DATA_SIZE))
      intensity = (Math.max(mean - 20, 0) / 255)
    }

    this.setState({intensity})
    setTimeout(this.tick.bind(this), 1000/60)
  }

  render() {
    let songData = this.props.song.data

    return (
      <div className='visualizer-app'>
        <Gaussian intensity={this.state.intensity}/>
        <Player artwork={ songData ? songData.artwork_url : null }/>
        <audio
          ref='player'
          src={ songData ? songData.song_url : ''}
          controls preload>
        </audio>

        <Modal/>
      </div>
    )
  }

}

export default connect(state => state)(App)