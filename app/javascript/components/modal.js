import React from 'react'
import classnames from 'classnames'

class Modal extends React.Component {

  render() {
    return (
      <div className='modal-overlay'>
        <div className='modal'>
          <div className='modal-text'>
            Hi! You can paste a link to the song page on SoundCloud below to visualise it.
          </div>
          <div className='modal-label'> Link to the song </div>
          <input className='modal-url' placeholder='https://soundcloud.com/'/>
          <div className='modal-button'> Do the thing! </div>
        </div>
      </div>
    )
  }
}

export default Modal