import { App } from "js/app.js"
import ReactDOM from "react-dom"
import React from "react"

import "sass/styles.scss"

function render() {
    let page = React.createElement(App)
    ReactDOM.render(page, document.getElementById("react"))
}
render()

if (module.hot) {
    module.hot.accept(["./app.js"], function() {
        console.clear()
        render()
    })
}

/*
Tested on Chrome

Things to do with more time
Caching of responses between pages
Save accessToken as cookie
Error handling
Loading states
Pagination look ahead
Handle authorization failure by logging them out
Enter key to submit
Put the lists in tables
Stop jumping around

If app was bigger/more complex:
Redux store
Parsing/creating of url done by passing remainder of url to child page

401 and 200 error codes are the wrong way around in the docs
*/
