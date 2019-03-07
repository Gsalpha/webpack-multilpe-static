const env = require('./config/env')
const paths = require('./config/paths')
const PUBLIC_URL = paths.servedPath
console.log(PUBLIC_URL)
const OUTPUT_PATH = env().stringified['process.env'].OUTPUT_URL
if (!OUTPUT_PATH) {
    throw new Error('迁移脚本需指定OUTPUT_PATH(该目录为静态资源目录)')
}
const gulp = require('gulp')
console.log(paths.appBuild)

function mvAssets() {
    return gulp
        .src([`${paths.appBuild}/**`])
        .pipe(gulp.dest(`${process.env.OUTPUT_PATH}${PUBLIC_URL}`))
}

exports.default = mvAssets
