const webpack = require("webpack");
const path = require("path");
const pkg = require('./package.json');
const branchName = require('child_process').execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const scriptName = pkg.displayName + (['main', 'master'].includes(branchName) ? '' : ` (${branchName})`);

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
    optimization: { minimize: false },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"), // directory to output the bundle
        filename: "bundle.js", // name of the output bundle
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name         ${scriptName}
// @namespace    ${pkg.publisher}
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       ${pkg.author}
// @supportURL   ${pkg.bugs.url}
// @license      ${pkg.license}
// @match        ${pkg.homepage}
// @icon         ${pkg.icon}
// @keywords     ${pkg.keywords.join(',')}
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// ==/UserScript==
`,
            raw: true,
        }),
    ],
};

// not needed since it's on the page
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js
