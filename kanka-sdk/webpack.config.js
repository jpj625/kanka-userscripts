import webpack from 'webpack';
import path from 'path';
import pkg from './package.json' with { type: "json" };
import { execSync } from 'child_process';
const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const scriptName = pkg.displayName + (['main', 'master'].includes(branchName) ? '' : ` (${branchName})`);

export default {
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
        Kanka: 'Kanka',
    },
    optimization: { minimize: false },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "bundle.js", // name of the output bundle
        path: path.resolve(import.meta.dirname, "dist"), // directory to output the bundle
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
// @grant        none
// ==/UserScript==
`,
            raw: true,
        }),
    ],
};
