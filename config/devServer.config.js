'use strict'
const paths = require('./paths')
const fs = require('fs')

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
const host = process.env.HOST || '0.0.0.0'
const port = process.env.port || 3000
module.exports = function(proxy) {
    return {
        watchContentBase: true,
        contentBase:paths.appSrc,
        hot: true,
        https: protocol === 'https',
        host,
        port,
        overlay: false,
        historyApiFallback: true,
        disableHostCheck: true,
        proxy,
        before(app,server) {
            console.log(paths.appSrc)
            // server._watch(`${paths.appSrc}/pages/**/*.html`);
            if (fs.existsSync(paths.proxySetup)) {
                require(paths.proxySetup)(app)
            }
        }
    }
}
