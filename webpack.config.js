/**
 * MaterialDesignIcons
 * Webpack configuration
 */
const path = require('path'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = env => {
    const isDev = !env.production;
    const target = env.target;

    const extractSass = new ExtractTextPlugin({
        filename: "[name].css",
        disable: isDev
    });

    const webpack = {
        entry: `./src/index-${target}.js`,
        target: target, // web or electron
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'app.js'
        },
        resolve: {
            alias: {
                vue: 'vue/dist/vue.js'
            }
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                }
            ],
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.scss$/,
                    use: extractSass.extract({
                        use: [{
                            loader: "css-loader"
                        }, {
                            loader: "sass-loader"
                        }],
                        // use style-loader in development
                        fallback: "style-loader"
                    })
                }
            ]
        },
        plugins: [
            extractSass
        ],
        devServer: {
            contentBase: path.join(__dirname, 'dist')
        }
    };

    if (!isDev) {
        webpack.plugins.push(new UglifyJSPlugin());
    }

    return webpack;
};
