const VALIDATE_TOKEN_URL = "https://oxygenrain.com/yourtime/auth/validate";
const REMOVE_TOKEN_URL = "https://oxygenrain.com/yourtime/auth/remove"
const DEFAULT_TIMEOUT = 1500;

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    var idToken = googleUser.getAuthResponse().id_token;

    $.ajax({
        method: "POST",
        url: VALIDATE_TOKEN_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            idtoken: idToken,
        },
        timeout: DEFAULT_TIMEOUT
    }).done((response) => {
        // TODO: check the response to see if it is any status code
        if (isStatusCode(response)) {
            console.log(`Unable to sign in. Status Code: ${response}`)
            return
        }
        metaContent = JSON.stringify({
            username: profile.getName(),
            token: response,
        });
        // Set response on a meta tag for the oxygenrain content script to read
        $("<meta/>", {
            name: "your-time-token-local",
            content: metaContent
        }).appendTo("head");
        // Normal cookie
        Cookies.set("yourtime-token-server", response, {
            domain: "oxygenrain.com",
            expires: 50 * 365,
        });
    }).fail((jqXHR, textStatus, error) => {
        console.log(error, jqXHR, textStatus);
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        const token = Cookies.get("yourtime-token-server");

        Cookies.remove("yourtime-token-server", {
            path: ""
        });
        // Tell content script to remove the storage
        $("<meta/>", {
            name: "your-time-token-local-remove",
            content: true
        }).appendTo("head");

        const removed = removeServerToken(token);
        if (removed) {
            console.log('User signed out.');
        } else {
            console.log(`Unable to sign out`);
        }
    }, function (error) {
        console.log(`Unable to sign out: ${error}`);
    });
}

function isStatusCode(response) {
    return response.length <= 3;
}

function removeServerToken(token) {
    $.ajax({
        method: "POST",
        url: REMOVE_TOKEN_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            idtoken: idToken,
        },
        timeout: DEFAULT_TIMEOUT
    }).then(() => {
        return true;
    }).fail(() => {
        return false;
    })
}
