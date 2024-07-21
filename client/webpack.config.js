module.exports = {
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
        },
      ],
    },
    mode: 'development',
//    optimization: {
//        usedExports: true,
//    }
  };