const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: "./src/main.ts", // path to your main TypeScript file
    mode: "production",
    // mode: "none",
    // mode: "development",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        mousetrap: 'Mousetrap',
    },
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "bundle.js", // name of the output bundle
        path: path.resolve(__dirname, "dist"), // directory to output the bundle
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name         Kanka.io @ Helper
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Improve the experience of referencing entities.
// @author       Infinite
// @license      MIT
// @match        https://app.kanka.io/w/*/edit*
// @icon         https://www.google.com/s2/favicons?domain=kanka.io
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// ==/UserScript==
`,
            raw: true,
        }),
    ],
};

