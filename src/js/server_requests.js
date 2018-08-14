const HOST = "https://guarded-thicket-22918.herokuapp.com/"
import axios from "axios"
import ms from "ms"
import * as R from "ramda"

export async function getAccessToken(email, password, expiry) {
    let response = await axios({
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        url: HOST + "login",
        data: JSON.stringify({
            email,
            password,
            expiry: ms(expiry)
        })
    })
    return response.data.accessToken
}

export async function testAccessToken(accessToken) {
    let response = await axios({
        method: "get",
        headers: {
            Authorization: accessToken
        },
        url: HOST
    })

    return response.data.token.exp * 1000
}

export async function getAppDetails(accessToken, appID) {
    let apps = await getAppsForUser(accessToken)
    return R.find(app => app.id === appID, apps)
}

export async function getAppsForUser(accessToken) {
    let response = await axios({
        method: "get",
        headers: {
            Authorization: accessToken
        },
        url: HOST + "apps"
    })
    return response.data.apps
}

export async function updateApp({ appID, accessToken, name, logo }) {
    return await axios({
        method: "put",
        headers: {
            Authorization: accessToken,
            "Content-Type": "application/json; charset=UTF-8"
        },
        url: HOST + "apps/" + appID,
        data: JSON.stringify({
            name,
            logo
        })
    })
}

export async function getUsersForApp({ appID, accessToken, page = 0 }) {
    const pageSize = 25

    let response = await axios({
        method: "get",
        headers: {
            Authorization: accessToken
        },
        url: `${HOST}apps/${appID}/users/?offset=${page * pageSize}&limit=${pageSize}`
    })
    return response.data.users
}
