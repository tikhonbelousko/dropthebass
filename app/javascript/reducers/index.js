import { combineReducers } from 'redux'
import { REQUEST_SONG, RECEIVE_SONG } from '../actions'

function song(state = {
  isFetching: false,
  data: null}, action) {

  switch (action.type) {

  case REQUEST_SONG:
    return Object.assign({}, state, {isFetching: true})

  case RECEIVE_SONG:
    return Object.assign({}, state, {
      isFetching: false,
      data: action.song
    })

  default:
    return state
  }
}

export default combineReducers({
  song
})