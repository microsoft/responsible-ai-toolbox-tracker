
import { resolve } from "path";
export const mode = "development";
export const entry = resolve(__dirname, "dist/index.js");
export const output = {
  path: resolve(__dirname, "dist"),
  filename: "index.js"
};
export const module = {
  rules: [
    {
      loader: 'ts-loader',
      options: {
        experimentalWatchApi: true,
        configFile: 'tsconfig.json'
      }
    },
    {
      test: /\.js$/,
      exclude: ["/node_modules/"],
      loader: "babel-loader"
    },
    {
      test: /\.(css|scss)$/,
      use: [
        'style-loader',
        'css-loader',
      ]
    }
  ],
};
export const target = 'node';