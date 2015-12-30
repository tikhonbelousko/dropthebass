import React from 'react'
import classNames from 'classnames'
import ReactSlider from 'react-slider'

class Player extends React.Component {

  get formatedTime() {
    let time = Math.floor(this.props.time)
    let minutes = '' + Math.floor(time / 60);
    let seconds = '0' + (time - minutes * 60);
    return minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  render() {
    let background = this.props.artwork ? `url(${this.props.artwork})` : false
    let classes = classNames({
      'player': true,
      '-paused': this.props.isPaused
    })

    return (
      <div className={classes}>
        <div className='player-artwork' style={{background}}>
          <div className='player-overlay' onClick={this.props.onPlay}></div>
        </div>

        <div className='player-content'>
          <div className='title'> {this.props.title} </div>
          <div className='singer'> {this.props.author} </div>
          <div className='progress-block'>
            <ReactSlider
              className='slider'
              barClassName='slider-bar'
              handleClassName='slider-handle'
              value={this.props.time}
              withBars
              min={0}
              max={this.props.duration}
              onChange={this.props.onSeek}
            />
            <div className='time'> {this.formatedTime} </div>
          </div>
        </div>

        <div className='player-open' onClick={this.props.onOpen}>Open new song</div>
      </div>
    )
  }
}

export default Player