import React from "react"
import PropTypes from "prop-types"
import { getAccessToken } from "js/server_requests"

window.DURATION = 30 * 60 * 1000 // For debugging purposes

export class LogIn extends React.Component {
    static propTypes = {
        onLoggedIn: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            errorMessage: null,
            isBusy: false
        }
    }

    async handleClick() {
        this.setState({ isBusy: true })
        let accessToken

        let duration = window.DURATION

        try {
            accessToken = await getAccessToken(this.state.email, this.state.password, duration)
        } catch (error) {
            this.setState({
                errorMessage: ((error.response || {}).data || {}).error || "Unknown Error"
            })
        }
        this.setState({ isBusy: false })
        if (accessToken) {
            this.props.onLoggedIn(accessToken, duration)
        }
    }

    render() {
        let message
        if (this.state.isBusy) {
            message = "Loading"
        } else if (this.state.errorMessage) {
            message = this.state.errorMessage
        } else {
            message = null
        }

        return (
            <div className="screen-sized flex-center-vertical">
                <div className="login-box">
                    <h1>Log In</h1>
                    <label>Email</label>
                    <input
                        type="text"
                        disabled={this.state.isBusy}
                        value={this.state.email}
                        onChange={event => this.setState({ email: event.target.value })}
                    />
                    <label>Password</label>
                    <input
                        disabled={this.state.isBusy}
                        type="password"
                        value={this.state.password}
                        onChange={event => this.setState({ password: event.target.value })}
                    />
                    <div>
                        <button onClick={() => this.handleClick()}>Submit</button>
                    </div>
                    <p>{message}</p>
                </div>
            </div>
        )
    }
}
