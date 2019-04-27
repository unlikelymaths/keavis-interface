module.exports = {
  mode: 'development',
  devServer: {
    contentBase: './dist',
    useLocalIp: true,
    host: '0.0.0.0',
    port: 8080
  },
  entry: {
    main: './src/main.js'
  },
  output: {
    filename: './map.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            {
              loader: "sass-loader",
              options: {
                  includePaths: ['./node_modules']
              }
            }
        ]
      },
      {
        test: /\.png$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};