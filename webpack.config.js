var path = require('path');

var config = {
  entry: [
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.styl', '.csv', '.glsl']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.styl$/,
        loader: 'style!css!stylus'
      },
      {
        test: /\.glsl$/,
        loader: 'shader'
      }
    ]
  }
};

module.exports = config;