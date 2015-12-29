import React from 'react'
import classnames from 'classnames'

class Modal extends React.Component {

  render() {
    let classes = classnames({
      'modal-overlay': true,
      '-open': this.props.isOpen
    })

    return (
      <div className={classes} onClick={this.props.onOverlayClick}>
        <div className='modal'>
          <div className='modal-text'>
            Hi! You can paste a link to the song page on SoundCloud below to visualise it.
          </div>
          <div className='modal-label'> Link to the song </div>
          <input className='modal-url' placeholder='https://soundcloud.com/'/>
          <div className='modal-button' onClick={this.props.onButtonClick}> Do the thing! </div>
        </div>
      </div>
    )
  }
}

export default Modal