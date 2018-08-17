const TOKEN_AUTH_URL = "https://oxygenrain.com/yourtime/auth/token";
const DEFAULT_TIMEOUT = 1500;

function onSignIn(googleUser) {
    var idToken = googleUser.getAuthResponse().id_token;

    $.ajax({
        method: "POST",
        url: TOKEN_AUTH_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            idtoken: idToken
        },
        timeout: DEFAULT_TIMEOUT
    }).done((response) => {
        // Host only cookie
        Cookies.set("yourtime-token-local", response, {
            domain: "",
            expires: 50 * 365,
        });
        // Normal cookie
        Cookies.set("yourtime-token-server", response, {
            domain: "oxygenrain.com",
            expires: 50 * 365,
        });
    }).fail((jqXHR, textStatus, error) => {
        console.log(error);
        console.log(jqXHR);
        console.log(textStatus);
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        Cookies.remove("yourtime-token", {
            path: ""
        });
    });
}
