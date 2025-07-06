const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({ url }) =>
            url.href.startsWith("https://story-api.dicoding.dev/v1/stories"),
          handler: "NetworkFirst",
          options: {
            cacheName: "story-api-cache",
            networkTimeoutSeconds: 3,
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.href.startsWith("https://tile.openstreetmap.org/"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "openstreetmap-tiles",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.href.startsWith("https://api.maptiler.com/"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "maptiler-api-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      importScripts: ["./sw.js"],
    }),
  ],
});
