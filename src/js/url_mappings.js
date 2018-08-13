import * as R from "ramda"

export const Pages = {
    home: "home",
    edit: "edit",
    logIn: "logIn"
}

export function getPropsFromURL(url) {
    let [path, query] = R.split("?", url.hash.slice(1))
    path = R.split("/", path)
    query = parseGetParameters(query)

    if (path.length === 1 && path[0] === "") {
        return {
            page: Pages.home,
            selectedAppID: null,
            title: "Home",
            urlParseError: false,
            userPage: 0
        }
    } else if (path[1] === "edit") {
        let selectedAppID = path[2]
        let userPage = parseInt(query.page || "0")
        return {
            page: Pages.edit,
            urlParseError: false,
            title: `App ${selectedAppID}`,
            selectedAppID,
            userPage
        }
    } else if (path[1] === "log_in") {
        return {
            page: Pages.logIn,
            selectedAppID: null,
            title: "Log In",
            urlParseError: false,
            userPage: 0
        }
    }

    return {
        page: "",
        urlParseError: true,
        title: "",
        selectedAppID: null,
        userPage: 0
    }
}

export function getURLFromProps({ page, selectedAppID, userPage }) {
    if (page === Pages.home) {
        return "#"
    } else if (page === Pages.edit) {
        return `#/edit/${selectedAppID}?page=${userPage || 0}`
    } else if (page === Pages.logIn) {
        return "#/log_in/"
    }

    throw new Error("Can not create URL from props " + JSON.stringify({ page, selectedAppID }))
}

function parseGetParameters(query) {
    if (!query) {
        return {}
    } else {
        return R.fromPairs(query.split("&").map(paramString => paramString.split("=", 2)))
    }
}
