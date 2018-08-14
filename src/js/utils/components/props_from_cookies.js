import Cookies from "js-cookie"
import * as R from "ramda"
import React from "react"

function mapObj(obj, func) {
    let pairs = R.toPairs(obj)
    let mappedPairs = pairs.map(([key, value]) => [key, func(key, value)])
    return R.fromPairs(mappedPairs)
}

export function propsFromCookies(names) {
    return function(ComponentToWrap) {
        return class PropsFromURL extends React.Component {
            constructor(props) {
                super(props)
                this.state = R.fromPairs(names.map(name => [name, undefined]))
            }

            componentWillMount() {
                let newState = mapObj(this.state, key => Cookies.get(key))
                this.setState(newState)
            }

            handleSetCookie(key, value, expires) {
                Cookies.set(key, value, { expires: expires / (1000 * 60 * 60 * 24) })
                this.setState({
                    ...this.state,
                    [key]: value
                })
            }

            render() {
                return (
                    <ComponentToWrap
                        {...this.props}
                        {...this.state}
                        setCookie={(...args) => this.handleSetCookie(...args)}
                    />
                )
            }
        }
    }
}
