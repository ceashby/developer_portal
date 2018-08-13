import React from "react"
import { Event } from "js/utils/event"
import { monkeyPatchHistoryFunctions } from "js/utils/monkey_patch_history"

export function propsFromURL(getPropsFromURL) {
    return function(ComponentToWrap) {
        return class PropsFromURL extends React.Component {
            constructor(props) {
                super(props)
                this.state = null
                this.updateStateFromURL = this.updateStateFromURL.bind(this)
            }

            componentWillMount() {
                window.addEventListener("popstate", this.updateStateFromURL)
                historyStateDidChange.subscribe(this.updateStateFromURL)

                this.updateStateFromURL()
            }

            updateStateFromURL() {
                let newState = getPropsFromURL(window.location)
                this.setState(newState)
            }

            componentWillUnmount() {
                window.removeEventListener("popState", this.updateStateFromURL)
                historyStateDidChange.unsubscribe(this.updateStateFromURL)
            }

            render() {
                return <ComponentToWrap {...this.props} {...this.state} />
            }
        }
    }
}

const historyStateDidChange = new Event()

monkeyPatchHistoryFunctions({
    didPop: historyStateDidChange,
    didPush: historyStateDidChange,
    didReplace: historyStateDidChange
})
