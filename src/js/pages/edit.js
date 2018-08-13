import React from "react"
import { getURLFromProps, Pages } from "js/url_mappings"
import PropTypes from "prop-types"
import { PseudoA } from "js/utils/components/pseudo_a_tag"
import { getAppsForUser, getUsersForApp, updateApp } from "js/server_requests"
import * as R from "ramda"

export class Edit extends React.Component {
    static propTypes = {
        accessToken: PropTypes.string.isRequired,
        appID: PropTypes.string.isRequired,
        userPage: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            isBusy: false,
            isSaved: true,
            users: [],
            name: "",
            logo: ""
        }
        this.updateUsersPromise = null
        this.updateDetailsPromise = null
    }

    componentDidMount() {
        this.updateUsers()
        this.updateAppDetails()
    }

    componentDidUpdate(prevProps) {
        if (this.props.appID !== prevProps.appID || this.props.userPage !== prevProps.userPage) {
            this.updateUsers()
        }

        if (this.props.appID !== prevProps.appID) {
            this.updateAppDetails()
        }
    }

    updateAppDetails() {
        if (this.updateDetailsPromise) {
            this.updateDetailsPromise.cancel()
            this.updateDetailsPromise = null
        }

        this.updateDetailsPromise = cancellablePromise(async isCancelled => {
            this.setState({ name: "Loading", logo: "Loading", isBusy: true })
            let apps = await getAppsForUser(this.props.accessToken)
            let app = R.find(app => app.id === this.props.appID, apps)

            if (!isCancelled()) {
                this.setState({ name: app.name, logo: app.logo, isSaved: true, isBusy: false })
            }
        })
    }

    updateUsers() {
        if (this.updateUsersPromise) {
            this.updateUsersPromise.cancel()
            this.updateUsersPromise = null
        }

        this.updateUsersPromise = cancellablePromise(async isCancelled => {
            this.setState({ users: [] })
            let users = await getUsersForApp({
                appID: this.props.appID,
                accessToken: this.props.accessToken,
                offset: this.props.userPage * 25
            })

            if (!isCancelled()) {
                this.setState({ users: users })
            }
        })
    }

    async handleSaveClick() {
        await updateApp({
            appID: this.props.appID,
            accessToken: this.props.accessToken,
            name: this.state.name,
            logo: this.state.logo
        })
        this.setState({ isSaved: true })
    }

    render() {
        let prevURL
        let prevIndex = this.props.userPage - 1
        if (prevIndex >= 0) {
            prevURL = getURLFromProps({
                page: Pages.edit,
                selectedAppID: this.props.appID,
                userPage: prevIndex
            })
        } else {
            prevURL = undefined
        }

        let nextURL
        if (this.state.users.length) {
            nextURL = getURLFromProps({
                page: Pages.edit,
                selectedAppID: this.props.appID,
                userPage: this.props.userPage + 1
            })
        } else {
            nextURL = undefined
        }

        return (
            <div className="list-box">
                <PseudoA href={getURLFromProps({ page: Pages.home })}>&lt; Home</PseudoA>
                <h1>Edit App</h1>
                <label>Name</label>
                <input
                    type="text"
                    value={this.state.name}
                    style={{ marginRight: "100%" }}
                    onChange={event => this.setState({ name: event.target.value, isSaved: false })}
                />
                <label>Logo</label>
                <input
                    type="text"
                    value={this.state.logo}
                    style={{ width: "100%" }}
                    onChange={event => this.setState({ logo: event.target.value, isSaved: false })}
                />
                <div className="save-button-container">
                    <button
                        disabled={this.state.isBusy || this.state.isSaved}
                        onClick={() => this.handleSaveClick()}
                    >
                        Save
                    </button>
                </div>
                <h1>Users</h1>
                <div>
                    <PseudoA className="link-button" href={prevURL}>
                        Previous
                    </PseudoA>
                    <span className="page-text">Page {this.props.userPage + 1}</span>
                    <PseudoA className="button" href={nextURL}>
                        Next
                    </PseudoA>
                </div>
                {this.state.users.map(user => (
                    <div key={user.id} className="list-item">
                        <h2>{user.name}</h2>
                        <p>{user.id}</p>
                        <p>{user.email}</p>
                        <img src={user.avatar} className="avatar" />
                    </div>
                ))}
            </div>
        )
    }
}

function cancellablePromise(func) {
    let isCancelled = false
    let promise = func(() => isCancelled)
    promise.cancel = () => {
        isCancelled = true
    }

    return promise
}
