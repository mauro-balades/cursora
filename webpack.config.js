const path = require("path");

module.exports = {
    devtool: "inline-source-map",
    entry: "./lib/index.ts",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "umd", // see https://webpack.js.org/configuration/output/#outputlibrarytype
            export: "default", // see https://github.com/webpack/webpack/issues/8480
            name: "Cursora",
        },
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
};
