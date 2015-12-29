import React from 'react'
import classNames from 'classnames'

class Player extends React.Component {

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
            <div className='progress'>
              <div className='fill'></div>
              <div className='handle'></div>
            </div>
            <div className='time'> {this.props.time} </div>
          </div>
        </div>

        <div className='player-open' onClick={this.props.onOpen}>Open new song</div>
      </div>
    )
  }
}

export default Player