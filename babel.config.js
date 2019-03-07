module.exports = function(api) {
    api.cache(true)
    const presets = ['@babel/react', '@babel/preset-env']
    const plugins = [
        '@babel/plugin-syntax-dynamic-import',
        [
            '@babel/plugin-proposal-decorators',
            {
                legacy: true
            }
        ],
        ['@babel/plugin-transform-runtime']
    ]
    return {
        presets,
        plugins
    }
}
