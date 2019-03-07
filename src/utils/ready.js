const addPolyfill = () =>
    window.Promise
        ? Promise.resolve()
        : import(/* webpackChunkName: "polyfill" */ './polyfill')

if (window.debug) {
    import(/* webpackChunkName:"vconsole" */ 'vconsole')
        .then(m => m.default)
        .then(VConsole => new VConsole())
}

const ready = (fn, runAfterDomContentLoaded = true) => {
    if (typeof fn !== 'function') {
        throw new Error('you should pass a function as a param')
    }
    if (runAfterDomContentLoaded) {
        document.addEventListener('DOMContentLoaded', () => {
            addPolyfill().then(fn)
        })
    } else {
        addPolyfill().then(fn)
    }
}

export default ready
