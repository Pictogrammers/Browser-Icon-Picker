const path = require('path'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: isDev
});

const webpack = {
    entry: './src/index.js',
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

module.exports = webpack;
