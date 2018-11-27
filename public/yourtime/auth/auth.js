const VALIDATE_TOKEN_URL = "https://oxygenrain.com/yourtime/auth/validate";
const GET_TOKEN_URL = "https://oxygenrain.com/yourtime/auth/tokens";
const REMOVE_TOKEN_URL = "https://oxygenrain.com/yourtime/auth/remove"
const DEFAULT_TIMEOUT = 1500;
const STATUS_CODE = {
    FOUND: "200",
    NOT_FOUND: "210",
    ERROR: "220",
    BAD_LOGIN: "230",
    OK: "240"
};

function onGetSecretCode() {
    const youtubeID = $("#youtube-id").val();
    if (!youtubeID.startsWith("UC")) {
        $("#youtube-id").attr("style", "box-shadow: 0px 0px 4px #ff0000");
        alert("Please enter a valid YouTube channel ID.")
        return
    }
    $("#loader").show();

    $.ajax({
        method: "GET",
        url: GET_TOKEN_URL,
        data: {
            channelid: youtubeID
        },
        timeout: DEFAULT_TIMEOUT
    }).done(response => {
        $("#loader").hide();
        if (response == STATUS_CODE.ERROR || response == STATUS_CODE.BAD_LOGIN) {
            alert(`Unable to get a secret token. Response: ${response}`)
            console.log(`Unable to get a secret token. Response: ${response}`)
            return
        }

        Cookies.set("yourtime-channel-id", youtubeID);
        $("#secret-code").val(response);
        $("#on-secret-code").show();
    }).fail((jqXHR, textStatus, error) => {
        $("#loader").hide();
        alert(`An error happened. ${error}`);
        console.log(error, jqXHR, textStatus);
    });
}

function onValidateChannel() {
    const channelid = Cookies.get("yourtime-channel-id");
    $.ajax({
        method: "GET",
        url: VALIDATE_TOKEN_URL,
        data: {
            channelid: channelid
        },
        timeout: DEFAULT_TIMEOUT
    }).done(response => {
        switch (response) {
            case STATUS_CODE.BAD_LOGIN:
                alert("The secret code was not in the description.")
            case STATUS_CODE.ERROR:
            default:
                break;
        }
    }).fail((jqXHR, textStatus, error) => {
        alert(`An error happened. ${error}`);
        console.log(error, jqXHR, textStatus);
    });
}

// TODO: delete token serverside if the user changes account without clicking signOut
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    var idToken = googleUser.getAuthResponse().id_token;
    const youtubeID = $("#youtube-id").val();
    if (youtubeID == "") {
        $("#youtube-id").attr("style", "box-shadow: 0px 0px 4px #ff0000");
        return
    }

    $.ajax({
        method: "POST",
        url: VALIDATE_TOKEN_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            idtoken: idToken,
            youtubeid: youtubeID
        },
        timeout: DEFAULT_TIMEOUT
    }).done((response) => {
        if (response != STATUS_CODE.OK) {
            console.log(`Unable to sign in. Response: ${response}`)
            return
        }
        const token = Cookies.get("yourtime-token-server");

        metaContent = JSON.stringify({
            username: profile.getName(),
            token: token,
        });
        // Set response on a meta tag for the oxygenrain content script to read
        $("<meta/>", {
            name: "your-time-token-local",
            content: metaContent
        }).appendTo("head");
        $("#signout").prop("disabled", false);
    }).fail((jqXHR, textStatus, error) => {
        $("#signout").prop("disabled", true);
        console.log(error, jqXHR, textStatus);
    });
}

function onSignOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        // Tell content script to remove the storage
        $("<meta/>", {
            name: "your-time-token-local-remove",
            content: true
        }).appendTo("head");

        $.ajax({
            method: "POST",
            url: REMOVE_TOKEN_URL,
            contentType: "application/x-www-form-urlencoded",
            timeout: DEFAULT_TIMEOUT
        }).then((content) => {
            if (content == STATUS_CODE.OK) {
                console.log("Sign out successful")
                $("#signout").prop("disabled", true);
            } else {
                $("#signout").prop("disabled", false);
                console.log(`Unable to delete token from server. Error: ${content}`);
            }
        }).fail((error) => {
            $("#signout").prop("disabled", false);
            console.log(`Unable to delete token from server. Error: ${error}`);
        });
    }, function (error) {
        $("#signout").prop("disabled", false);
        console.log(`Unable to sign out: ${error}`);
    });
}