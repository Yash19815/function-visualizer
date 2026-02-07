const path = require("path");

/**
 * Webpack configuration for VS Code extension
 * Creates two separate bundles:
 * 1. Extension code (Node.js environment)
 * 2. Webview code (Browser environment with React)
 */

// Extension bundle configuration (runs in Node.js/VS Code environment)
const extensionConfig = {
  context: __dirname,
  target: "node",
  mode: "production",
  entry: "./src/extension/extension.ts",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.extension.json"),
            },
          },
        ],
      },
    ],
  },
  devtool: "source-map",
  infrastructureLogging: {
    level: "log",
  },
};

// Webview bundle configuration (runs in browser/webview environment)
const webviewConfig = {
  context: __dirname,
  target: "web",
  mode: "production",
  entry: "./src/webview/index.tsx",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "webview.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.extension.json"),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  performance: {
    hints: false,
  },
  devtool: "source-map",
  infrastructureLogging: {
    level: "log",
  },
};

module.exports = [extensionConfig, webviewConfig];
