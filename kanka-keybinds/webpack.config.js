const webpack = require("webpack");
const path = require("path");
const pkg = require('./package.json')

module.exports = {
    entry: "./src/main.ts", // path to your main TypeScript file
    mode: "production",
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
        select2: 'Select2',
        mousetrap: 'Mousetrap',
        'tippy.js': 'tippy',
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
// @name         Kanka.io Keybinds
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  Set your own keyboard shortcuts for entity view page on Kanka.
// @author       Infinite
// @license      ${pkg.license}
// @match        https://app.kanka.io/w/*/entities/*
// @icon         https://www.google.com/s2/favicons?domain=kanka.io
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js
// ==/UserScript==
`,
            raw: true,
        }),
    ],
};

