const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const paths = require('./config/paths')
const getClientEnvironment = require('./config/env')
const getCSSModuleLocalIdent = require('./config/getCSSModuleLocalIdent')
const getDevServerConfig = require('./config/devServer.config')
const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'
const isEnvMobile = process.env.RUNTIME === 'mobile'

function config(webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development'
    const isEnvProduction = webpackEnv === 'production'
    const publicPath = isEnvProduction
        ? paths.servedPath
        : isEnvDevelopment && '/'

    const publicUrl = isEnvProduction
        ? publicPath.slice(0, -1)
        : isEnvDevelopment && ''
    const env = getClientEnvironment(publicUrl)

    const getStyleLoaders = (cssOptions, preProcessor) => {
        const postcssPlugins = [
            require('postcss-flexbugs-fixes'),
            require('autoprefixer')({
                autoprefixer: {
                    flexbox: 'no-2009'
                },
                stage: 3
            })
        ]

        const loaders = [
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    ident: 'postcss',
                    plugins: isEnvMobile
                        ? postcssPlugins.concat(
                              require('postcss-px-to-viewport')({
                                  unitToConvert: 'px',
                                  viewportWidth: 750,
                                  unitPrecision: 5,
                                  viewportUnit: 'vw',
                                  fontViewportUnit: 'vw',
                                  selectorBlackList: [/^\.am-/],
                                  minPixelValue: 1,
                                  mediaQuery: false
                              })
                          )
                        : postcssPlugins
                }
            }
        ].filter(Boolean)
        if (preProcessor) {
            loaders.push({
                loader: require.resolve(preProcessor)
            })
        }
        return loaders
    }
    const generatedHtmlTemplates = () =>
        paths.appEntryName.map(item => {
            return new HtmlWebpackPlugin({
                filename: `${item}.html`,
                template: `${
                    paths.appEntry[item].split('/index.js')[0]
                }/index.html`,
                inject: 'body',
                hash: false,
                chunks: [`runtime`, 'vendor', item]
            })
        })
    return {
        mode: isEnvProduction
            ? 'production'
            : isEnvDevelopment && 'development',
        // Stop compilation early in production
        bail: isEnvProduction,
        devtool: isEnvProduction
            ? shouldUseSourceMap
                ? 'source-map'
                : false
            : isEnvDevelopment && 'eval-source-map',
        entry: paths.appEntry,
        output: {
            path: isEnvProduction ? paths.appBuild : undefined,
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'static/js/[name].[chunkhash:8].js'
                : isEnvDevelopment && 'static/js/[name].js',
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[chunkhash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
            publicPath: publicPath
        },
        devServer: getDevServerConfig({}),
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2
                        },
                        mangle: {
                            safari10: true
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true
                        }
                    },
                    parallel: true,
                    cache: true,
                    sourceMap: shouldUseSourceMap
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        map: false,
                        zindex: false
                    }
                })
            ],
            splitChunks: {
                chunks: 'all',
                name: 'vendor'
            },
            runtimeChunk: {
                name: 'runtime'
            }
        },
        resolve: {
            alias: {
                '@': paths.appSrc
            }
        },
        module: {
            rules: [
                { parser: { requireEnsure: false } },
                {
                    test: /\.(js|mjs|jsx)$/,
                    enforce: 'pre',
                    use: ['eslint-loader'],
                    include: paths.appSrc
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                name:
                                    'static/images/[folder]/[name].[hash:8].[ext]'
                            }
                        },
                        {
                            test: /\.(js|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                cacheDirectory: true,
                                cacheCompression: isEnvProduction,
                                compact: isEnvProduction
                            }
                        },
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1
                            }),
                            sideEffects: true
                        },
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                modules: true,
                                getLocalIdent: getCSSModuleLocalIdent
                            })
                        },
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2
                                },
                                'sass-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    modules: true,
                                    getLocalIdent: getCSSModuleLocalIdent
                                },
                                'sass-loader'
                            )
                        },
                        {
                            test: /\.html$/,
                            use: {
                                loader: 'html-loader'
                            }
                        },
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [
                                /\.(js|mjs|jsx|ts|tsx)$/,
                                /\.html$/,
                                /\.json$/
                            ],
                            options: {
                                name:
                                    'static/files/[folder]/[name].[hash:8].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            ...generatedHtmlTemplates(),
            isEnvDevelopment && new webpack.NamedModulesPlugin(),
            isEnvProduction && new webpack.HashedModuleIdsPlugin(),
            new webpack.DefinePlugin(env.stringified),
            isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            isEnvDevelopment && new CaseSensitivePathsPlugin(),
            isEnvProduction &&
                new MiniCssExtractPlugin({
                    filename: 'static/css/[name].[contenthash:8].css',
                    chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
                }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        ].filter(Boolean),
        node: {
            module: 'empty',
            dgram: 'empty',
            dns: 'mock',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        },
        performance: false
    }
}

module.exports = config(process.env.NODE_ENV)
