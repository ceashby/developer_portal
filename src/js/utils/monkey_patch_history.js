// Adds subscribable events to the history popState, pushState and popState functions
export function monkeyPatchHistoryFunctions({ didPop, didPush, didReplace }) {
    monkeyPatchWithEvent(history, "popState", didPop)
    monkeyPatchWithEvent(history, "pushState", didPush)
    monkeyPatchWithEvent(history, "replaceState", didReplace)
}

function monkeyPatchWithEvent(object, method, event) {
    let innerMethod = object[method]
    object[method] = function(...args) {
        let result = innerMethod.call(object, ...args)
        event.dispatch(...args)
        return result
    }
}
