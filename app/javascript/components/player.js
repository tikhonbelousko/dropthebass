import React from 'react'

class Player extends React.Component {

  render() {
    let background = this.props.artwork ? `url(${this.props.artwork})` : false

    return (
      <div className='player'>
        <div className='player-artwork' style={{background}}>
          <div className='player-overlay'></div>
        </div>

        <div className='player-content'>
          <div className='title'> Disclosure - Omen (Dillon Fran… </div>
          <div className='singer'> Dillonfrancis </div>
          <div className='progress-block'>
            <div className='progress'>
              <div className='fill'></div>
              <div className='handle'></div>
            </div>
            <div className='time'> 0:29 </div>
          </div>
        </div>

        <div className='player-open' onClick={this.props.onOpen}>Open new song</div>
      </div>
    )
  }
}

export default Player