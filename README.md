## Description
Drop the bass is WebGL and Web Audio experiment. I used
React and Redux for dealing with interface. The audio source is SoundCloud API.

You can see the result on: [http://dazzz.github.io/dropthebass/](http://dazzz.github.io/dropthebass/)

## Running a project

- Clone repository
- Install Node.js (>=5.3)
- Run following commands
```bash
  npm install
  npm run dev
```

## Project structure
The source code is located in `/app/` folder. This folder have the following structure:

### Components
Set of React components used in the app.

- `index.js` - renders app.js.
- `app.js` - smart component that wraps the whole application.
- `player.js` - player displayed in left upper corner. Allows seeking through the song and pausing it.
- `gaussian.js` - WebGL gaussian curve visualisation. Takes intensity as a parameters and renders it on screen.
    - uses `/app/utils.js` for initializing routines;
    - uses shaders located in `/app/shaders/` folder;
    - uses [gl-matrix](http://glmatrix.net/) for dealing with matrices.
- `modal.js` - used for opening new songs.

### Actions, Reducers, Stores
Actions, Reducers, Stores are paradigms of [Redux](https://github.com/rackt/redux) library for handling user interactions and managing data state.


## Evaluation
Here is the list of all tasks that I accomplished in course of doing this assignment:

- Studied how WebGL works.
- Studied how WebGL is related to OpenGL.
- Studied how WebAudio API works.
- Studied SoundCloud API.
- Created visulisation of current song volume in form of 3D gaussian curve.
- Removed blinking effect of animation using `requestAnimationFrame()`.
- Created React component that wraps my WebGL visualisation, so that it could be reused multiple times on the same page. Component is parametrised by intensity of gaussian curve.
- Integrated modern build tool like [webpack](https://webpack.github.io/) for building a project and loading shaders from separate file.
- Used Redux for handling user input and storing application state.
- Added controls for manipulating a song and loading new data from SoundCloud.
