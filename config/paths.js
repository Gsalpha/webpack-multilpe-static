const path = require('path')
const fs = require('fs')
const url = require('url')
const glob = require('glob')
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const envPublicUrl = process.env.PUBLIC_URL
const runtimeEnv = process.env.RUNTIME

function ensureSlash(inputPath, needsSlash) {
    const hasSlash = inputPath.endsWith('/')
    if (hasSlash && !needsSlash) {
        return inputPath.substr(0, inputPath.length - 1)
    } else if (!hasSlash && needsSlash) {
        return `${inputPath}/`
    } else {
        return inputPath
    }
}

const getPublicUrl = appPackageJson =>
    envPublicUrl || require(appPackageJson).homepage

function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson)
    const servedUrl =
        envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/')
    return ensureSlash(servedUrl, true)
}

const appSrc = resolveApp('src')
const appEntry = {}
const appEntryName = []
glob.sync(path.resolve(appSrc, `${runtimeEnv}/pages/*/index.js`)).forEach(path => {
    try {
        const entryName = path.split(`/src/${runtimeEnv}/pages/`)[1].split('/index.js')[0]
        appEntry[entryName] = path
        appEntryName.push(entryName)
    } catch (e) {
        console.log(`请将入口文件配置在src/${runtimeEnv}/pages目录下`)
    }
})

module.exports = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveApp(`build/${runtimeEnv}`),
    appPublic: resolveApp('public'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appEntry,
    appEntryName,
    appTsConfig: resolveApp('tsconfig.json'),
    proxySetup: resolveApp('src/setupProxy.js'),
    appNodeModules: resolveApp('node_modules'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json'))
}
