import React from "react"

export class PseudoA extends React.Component {
    render() {
        return (
            <a
                {...this.props}
                onClick={event => {
                    event.preventDefault()
                    history.pushState(null, "", this.props.href)
                }}
            />
        )
    }
}
