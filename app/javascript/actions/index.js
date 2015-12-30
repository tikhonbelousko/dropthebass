const CLIENT_ID = '61b17ec61bd38e4b6cfe078e58d5a062'

export const REQUEST_SONG = 'REQUEST_SONG'
function requestSong() {
  return {
    type: REQUEST_SONG,
  }
}

export const RECEIVE_SONG = 'RECEIVE_SONG'
function receiveSong(song) {
  return {
    type: RECEIVE_SONG,
    song: song,
  }
}

export function fetchSong(songUrl) {
  return (dispatch) => {
    dispatch(requestSong())

    SC.initialize({
      client_id: CLIENT_ID,
    })

    SC.get('/resolve', {url: songUrl}).then((song) => {
      if (song.kind == 'track') {
        song.song_url = `${song.stream_url}?client_id=${CLIENT_ID}`
        dispatch(receiveSong(song))
      }
    })
  }
}
