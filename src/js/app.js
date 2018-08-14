import React from "react"
import { propsFromURL } from "js/utils/components/props_from_url"
import { getPropsFromURL, Pages } from "js/url_mappings"
import PropTypes from "prop-types"
import { RequiredNullPropTypes } from "js/utils/null_prop_types"
import { LogIn } from "js/pages/log_in"
import { Edit } from "js/pages/edit"
import { Home } from "js/pages/home"
import { getURLFromProps } from "js/url_mappings"
import { testAccessToken } from "js/server_requests"
import { propsFromCookies } from "js/utils/components/props_from_cookies"

@propsFromURL(getPropsFromURL)
@propsFromCookies(["accessToken"])
export class App extends React.Component {
    static propTypes = {
        page: PropTypes.string.isRequired,
        selectedAppID: RequiredNullPropTypes.string,
        urlParseError: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        userPage: PropTypes.number.isRequired,
        accessToken: PropTypes.string.isRequired,
        setCookie: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            tokenWasValidated: false
        }
        this.logOutTimeout = null
    }

    async componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate(prevProps) {
        if (!this.state.tokenWasValidated && this.props.accessToken) {
            this.validateToken()
        }

        document.title = this.props.title
        let redirect = getRedirect(
            this.props.urlParseError,
            !this.props.accessToken,
            this.props.page
        )
        if (redirect) {
            history.replaceState(null, "", redirect)
        }
    }

    async validateToken() {
        try {
            let expiryTime = await testAccessToken(this.props.accessToken)
            this.setAccessTokenTimeout(expiryTime - Date.now())
        } catch (error) {
            if (error) {
                this.props.setCookie("accessToken", "")
            } else {
                throw error
            }
        }

        this.setState({ tokenWasValidated: true })
    }

    handleLogIn(accessToken, duration) {
        this.props.setCookie("accessToken", accessToken, duration)
        this.setAccessTokenTimeout(duration)
        this.setState({ tokenWasValidated: true })
        history.replaceState(null, "", getURLFromProps({ page: Pages.home }))
    }

    logOut() {
        this.props.setCookie("accessToken", "")
    }

    setAccessTokenTimeout(duration) {
        clearTimeout(this.logOutTimeout)
        this.logOutTimeout = setTimeout(() => {
            this.props.setCookie("accessToken", "")
        }, duration)
    }

    render() {
        if (this.props.accessToken && !this.state.tokenWasValidated) {
            return null
        }

        if (getRedirect(this.props.urlParseError, !this.props.accessToken, this.props.page)) {
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

function getRedirect(urlParseError, noAccessToken, page) {
    if (urlParseError) {
        return getURLFromProps({ page: Pages.home })
    } else if (noAccessToken && page !== Pages.logIn) {
        return getURLFromProps({ page: Pages.logIn })
    }
}
