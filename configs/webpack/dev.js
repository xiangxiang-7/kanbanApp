// development config
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "development",
  entry: [
    // "react-hot-loader/patch", // activate HMR for React
    // "webpack-dev-server/client?http://localhost:9012", // bundle the client for webpack-dev-server and connect to the provided endpoint
    // "webpack/hot/only-dev-server", // bundle the client for hot reloading, only- means to only hot reload for successful updates
    "./index.tsx", // the entry point of our app
  ],
  devServer: {
    port: 9000,
    hot: true, // enable HMR on the server
  },
  devtool: "cheap-module-source-map",
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
  ],
});
