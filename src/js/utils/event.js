export class Event {
    constructor() {
        this.callbacks = []
    }

    subscribe(callback) {
        this.callbacks.push(callback)
    }

    unsubscribe(callback) {
        let index = this.callbacks.indexOf(callback)
        if (index !== -1) {
            this.callbacks.splice(index, 1)
        }
    }

    dispatch(...args) {
        this.callbacks.forEach(function(callback) {
            callback(...args)
        })
    }
}
