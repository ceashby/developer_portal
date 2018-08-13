import React from "react"
import { propsFromURL } from "js/utils/components/props_from_url"
import { getPropsFromURL, Pages } from "js/url_mappings"
import PropTypes from "prop-types"
import { RequiredNullPropTypes } from "js/utils/null_prop_types"
import { LogIn } from "js/pages/log_in"
import { Edit } from "js/pages/edit"
import { Home } from "js/pages/home"
import { getURLFromProps } from "js/url_mappings"

@propsFromURL(getPropsFromURL)
export class App extends React.Component {
    static propTypes = {
        page: PropTypes.string.isRequired,
        selectedAppID: RequiredNullPropTypes.string,
        urlParseError: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        userPage: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            accessToken: null
        }
        this.logOutTimeout = null
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        document.title = this.props.title
        let redirect = getRedirect(
            this.props.urlParseError,
            Boolean(this.state.accessToken),
            this.props.page
        )
        if (redirect) {
            history.replaceState(null, "", redirect)
        }
    }

    handleLogIn(accessToken, expiryTimeMilli) {
        this.setState({ accessToken: accessToken })
        clearTimeout(this.logOutTimeout)
        this.logOutTimeout = setTimeout(() => {
            this.setState({ accessToken: null })
        }, expiryTimeMilli)

        history.replaceState(null, "", getURLFromProps({ page: Pages.home }))
    }

    render() {
        if (
            getRedirect(this.props.urlParseError, Boolean(this.state.accessToken), this.props.page)
        ) {
            return null
        }

        if (this.props.page === Pages.home) {
            return <Home accessToken={this.state.accessToken} />
        } else if (this.props.page === Pages.edit) {
            return (
                <Edit
                    accessToken={this.state.accessToken}
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

function getRedirect(urlParseError, hasAccessToken, page) {
    if (urlParseError) {
        return getURLFromProps({ page: Pages.home })
    } else if (!hasAccessToken && page !== Pages.logIn) {
        return getURLFromProps({ page: Pages.logIn })
    }
}
