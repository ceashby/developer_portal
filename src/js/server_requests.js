const HOST = "https://guarded-thicket-22918.herokuapp.com/"
import axios from "axios"
import ms from "ms"

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
    return await axios({
        method: "post",
        headers: {
            Authorization: accessToken
        },
        url: HOST
    })
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

export async function getUsersForApp({ appID, accessToken, offset = 0 }) {
    let response = await axios({
        method: "get",
        headers: {
            Authorization: accessToken
        },
        url: `${HOST}apps/${appID}/users/?offset=${offset}&limit=25`
    })
    return response.data.users
}
