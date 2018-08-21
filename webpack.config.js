var CopyWebpackPlugin = require("copy-webpack-plugin")
var webpack = require("webpack")
var path = require("path")

module.exports = function(env) {
    env = env || {}
    let mode = env.mode || "development"
    let isDevelopment = env.mode === "development"
    return {
        resolve: {
            modules: ["./node_modules", "./src"]
        },
        devtool: "source-map",
        context: path.join(__dirname, "src"),
        entry: {
            main: ["babel-polyfill", "./js/main.js"]
        },
        output: {
            filename: isDevelopment ? "src/html/[name].js" : `dist/${mode}/[name].js`
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: filterUndefined([
                        isDevelopment
                            ? {
                                  loader: "react-hot-loader"
                              }
                            : undefined,
                        {
                            loader: "babel-loader",
                            query: {
                                babelrc: false,
                                presets: ["react", "es2015"],
                                plugins: [
                                    // Stage 4
                                    // Must be applied before transform-class-properties to ensure class properties get applied before the class is decorated
                                    // See: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy/issues/17
                                    "transform-decorators-legacy",

                                    // Stage 2
                                    "syntax-dynamic-import",
                                    "transform-class-properties",

                                    // Stage 3
                                    "transform-object-rest-spread",
                                    // "transform-async-generator-functions", // No longer needed as chrome can handle async/await directly

                                    // Stage 4
                                    "syntax-trailing-function-commas",
                                    // "transform-async-to-generator", // No longer needed as chrome can handle async/await directly
                                    "transform-exponentiation-operator"
                                ]
                            }
                        }
                    ])
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: ["style-loader", "css-loader", "sass-loader"]
                }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([{ from: "html/**", to: "dist/" + mode, flatten: true }]),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.NamedModulesPlugin()
        ],
        watch: isDevelopment,
        devServer: {
            headers: { "Access-Control-Allow-Origin": "*" }
        }
    }
}

function filterUndefined(items) {
    return items.filter(item => item !== undefined)
}
