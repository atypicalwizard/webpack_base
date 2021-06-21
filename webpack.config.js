

const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const entryObject = determineAllEntryPoints();

module.exports = {
    mode: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
    entry: entryObject,
    output: {
        path: path.resolve(__dirname, 'css')
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                // publicPath is the relative path of the resource to the context
                                // e.g. for ./css/admin/main.css the publicPath will be ../../
                                // while for ./css/main.css the publicPath will be ../
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            },
                        },
                    },
                    // Translates CSS into CommonJS
                    'css-loader?-url!',
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
    ],
    devtool: 'source-map',
};

function determineAllEntryPoints() {
    let entryObject = {};
    //Dynamic entry generation
    const plainSassEntries = glob.sync(__dirname + '/sass/**/*.scss');
    for (let i = 0; i < plainSassEntries.length; i++) {
        let name = plainSassEntries[i].replace(__dirname + '/sass/', '').replace('.scss', '');
        const nameParts = name.split('/');

        if (nameParts[(nameParts.length - 1)].charAt(0) !== '_') {
            if (name.indexOf('/' + nameParts[(nameParts.length - 1)] + '/' + nameParts[(nameParts.length - 1)]) !== -1) {
                name = name.replace('/' + nameParts[(nameParts.length - 1)] + '/' + nameParts[(nameParts.length - 1)], '/' + nameParts[(nameParts.length - 1)]);
            }
            entryObject[name] = plainSassEntries[i];
        }
    }

    return entryObject;
}