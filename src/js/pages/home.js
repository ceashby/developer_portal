import React from "react"
import { getURLFromProps, Pages } from "js/url_mappings"
import { PseudoA } from "js/utils/components/pseudo_a_tag"
import PropTypes from "prop-types"
import { getAppsForUser } from "js/server_requests"

export class Home extends React.Component {
    static propTypes = {
        accessToken: PropTypes.string.isRequired,
        onLogOutClick: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)
        this.state = {
            apps: []
        }
    }

    async componentDidMount() {
        let apps = await getAppsForUser(this.props.accessToken)
        this.setState({ apps: apps })
    }

    componentWillUnmount() {
        this.setState({ apps: [] })
    }

    render() {
        return (
            <div className="list-box">
                <button onClick={this.props.onLogOutClick}>Log Out</button>
                <h1>Apps</h1>
                {this.state.apps.map(app => (
                    <div key={app.id} className="list-item">
                        <h2>{app.name}</h2>
                        <img src={app.logo} />
                        <p>{app.id}</p>
                        <p>{app.created}</p>
                        <div className="right-button-container">
                            <PseudoA
                                className="button"
                                href={getURLFromProps({ page: Pages.edit, selectedAppID: app.id })}
                            >
                                Edit
                            </PseudoA>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}
