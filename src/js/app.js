import PropTypes from "prop-types"
import React from "react"
import { Edit } from "js/pages/edit"
import { getPropsFromURL, Pages } from "js/url_mappings"
import { getURLFromProps } from "js/url_mappings"
import { Home } from "js/pages/home"
import { LogIn } from "js/pages/log_in"
import { propsFromCookies } from "js/utils/components/props_from_cookies"
import { propsFromURL } from "js/utils/components/props_from_url"
import { RequiredNullPropTypes } from "js/utils/null_prop_types"
import { testAccessToken } from "js/server_requests"

@propsFromURL(getPropsFromURL)
@propsFromCookies(["accessToken"])
export class App extends React.Component {
    static propTypes = {
        page: PropTypes.string.isRequired,
        selectedAppID: RequiredNullPropTypes.string,
        urlParseError: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        userPage: PropTypes.number.isRequired,
        accessToken: PropTypes.string,
        setCookie: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            isValidatingToken: true
        }
        this.logOutTimeout = null
    }

    async componentDidMount() {
        if (this.props.accessToken) {
            this.validateToken()
        } else {
            this.setState({ isValidatingToken: false })
        }

        this.componentDidUpdate()
    }

    componentDidUpdate() {
        document.title = this.props.title

        let redirectURL = getRedirectIfInvalid(this.props)
        if (redirectURL) {
            history.pushState(null, "", redirectURL)
        }
    }

    async validateToken() {
        this.setState({ isValidatingToken: true })
        try {
            let expiryTime = await testAccessToken(this.props.accessToken)
            this.setAccessTokenTimeout(expiryTime - Date.now())
        } catch (error) {
            if (((error || {}).response || {}).status === 401) {
                this.logOut()
            } else {
                throw error
            }
        }
        this.setState({ isValidatingToken: false })
    }

    handleLogIn(accessToken, duration) {
        this.props.setCookie("accessToken", accessToken, duration)
        this.setAccessTokenTimeout(duration)
        this.setState({ tokenWasValidated: true })
        history.replaceState(null, "", getURLFromProps({ page: Pages.home }))
    }

    logOut() {
        this.props.setCookie("accessToken", "")
        history.pushState(null, "", getURLFromProps({ page: Pages.logIn }))
    }

    setAccessTokenTimeout(duration) {
        clearTimeout(this.logOutTimeout)
        this.logOutTimeout = setTimeout(() => {
            this.logOut()
        }, duration)
    }

    render() {
        if (this.state.isValidatingToken) {
            return null
        }

        if (getRedirectIfInvalid(this.props)) {
            return null
        }

        if (this.props.page === Pages.home) {
            return <Home accessToken={this.props.accessToken} onLogOutClick={() => this.logOut()} />
        } else if (this.props.page === Pages.edit) {
            return (
                <Edit
                    accessToken={this.props.accessToken}
                    appID={this.props.selectedAppID}
                    userPage={this.props.userPage}
                />
            )
        } else if (this.props.page === Pages.logIn) {
            return (
                <LogIn
                    onLoggedIn={(accessToken, expiryTime) =>
                        this.handleLogIn(accessToken, expiryTime)
                    }
                />
            )
        } else {
            throw new Error(`Unrecognised page type ${this.props.page}`)
        }
    }
}

function getRedirectIfInvalid({ urlParseError, accessToken, page }) {
    if (urlParseError) {
        return getURLFromProps({ page: Pages.home })
    } else if (!accessToken && page !== Pages.logIn) {
        return getURLFromProps({ page: Pages.logIn })
    }
}
