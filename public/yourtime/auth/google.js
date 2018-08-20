const TOKEN_AUTH_URL = "https://oxygenrain.com/yourtime/auth/token";
const DEFAULT_TIMEOUT = 1500;

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    var idToken = googleUser.getAuthResponse().id_token;

    $.ajax({
        method: "POST",
        url: TOKEN_AUTH_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            idtoken: idToken,
        },
        timeout: DEFAULT_TIMEOUT
    }).done((response) => {
        // TODO: check the response to see if it is any status code
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
        console.log('User signed out.');
        Cookies.remove("yourtime-token", {
            path: ""
        });
    }, function (error) {
        console.log("Unable to sign out");
    });
}
