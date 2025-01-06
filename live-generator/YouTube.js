// ===== Auth API =====
function getYouTubeService_() {
    // Create a new service with the given name. The name will be used when
    // persisting the authorized token, so ensure it is unique within the
    // scope of the property store.
    return (
        OAuth2.createService('youtube')

            // Set the endpoint URLs, which are the same for all Google services.
            .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
            .setTokenUrl('https://accounts.google.com/o/oauth2/token')

            // Set the client ID and secret, from the Google Developers Console.
            .setClientId(CLIENT_ID)
            .setClientSecret(CLIENT_SECRET)

            // Set the name of the callback function in the script referenced
            // above that should be invoked to complete the OAuth flow.
            .setCallbackFunction('authCallback')

            // Set the property store where authorized tokens should be persisted.
            .setPropertyStore(PropertiesService.getUserProperties())

            // Set the scopes to request (space-separated for Google services).
            .setScope([
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtubepartner',
                'https://www.googleapis.com/auth/youtubepartner-channel-audit',
            ])
    );
}

function authCallback(request) {
    const service = getYouTubeService_();
    const isAuthorized = service.handleCallback(request);
    if (isAuthorized) {
        showSidebar();
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab.');
    }
}

function hasAccess() {
    return getYouTubeService_().hasAccess();
}

function getToken_() {
    if (!hasAccess()) {
        showSidebar();
        throw new Error('Please Sign In, your token has expired.');
    }
    return getYouTubeService_().getAccessToken();
}

function signOut() {
    getYouTubeService_().reset();
}

// ===== YouTube API =====
const BASEURL = 'https://www.googleapis.com/youtube/v3/';

function buildUrl(url, params) {
    var params = params || {}; //allow for NULL options
    var paramString = Object.keys(params)
        .map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        })
        .join('&');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}

function fetchUrl(path, token, options = {}) {
    const fetchOptions = {
        method: '',
        muteHttpExceptions: true,
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
    };
    const url = BASEURL + path;

    for (option in options) {
        fetchOptions[option] = options[option];
    }

    const response = UrlFetchApp.fetch(url, fetchOptions);
    if (response.getResponseCode() != 200) {
        throw new Error(response.getContentText());
    } else {
        return JSON.parse(response.getContentText());
    }
}

function fetchPage(path, token, options, returnParamPath) {
    var fetchOptions = {
        method: '',
        muteHttpExceptions: true,
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
    };
    for (option in options) {
        fetchOptions[option] = options[option];
    }

    const ret = [];
    let nextPageToken;
    let url = BASEURL + path;
    do {
        const response = UrlFetchApp.fetch(url, fetchOptions);

        if (response.getResponseCode() != 200) {
            throw new Error(response.getContentText());
        } else {
            const data = JSON.parse(response.getContentText());
            console.log(data.items.map((item) => item.snippet.title).join('; '));
            nextPageToken = data.nextPageToken;
            ret.push(...data[returnParamPath]);
        }
        url = buildUrl(BASEURL + path, { pageToken: nextPageToken });
    } while (nextPageToken);
    return ret;
}

function insertBroadcast(data) {
    const start = `${data.Year}-${data.Month}-${data.Day}T${data.Hour}:${data.Minute}:00+0530`;
    const payload = {
        snippet: {
            title: data.Title,
            description: '',
            scheduledStartTime: start,
            scheduledEndTime: start,
        },
        status: {
            privacyStatus: data.Visibility,
        },
        contentDetails: {
            enableDvr: data.DVR,
            enableAutoStart: data['Auto Start'],
            enableAutoStop: data['Auto Stop'],
            latencyPreference: data['Latency'],
            boundStreamId: data['Key ID'],
        },
    };
    const path = buildUrl('liveBroadcasts', { part: 'snippet,contentDetails,status' });
    const callOptions = { method: 'POST', payload: JSON.stringify(payload) };
    const response = fetchUrl(path, getToken_(), callOptions);
    console.log(response);
    return response;
}

function insertStream(data) {
    const payload = {
        snippet: {
            title: data.Title,
        },
        cdn: {
            ingestionType: 'rtmp',
            frameRate: '60fps',
            resolution: '1080p',
        },
    };
    const path = buildUrl('liveStreams', { part: 'snippet,cdn' });
    const callOptions = { method: 'POST', payload: JSON.stringify(payload) };
    const response = fetchUrl(path, getToken_(), callOptions);
    console.log(response);
    return response;
}

// Bind the broadcast to the video stream. By doing so, you link the video that
// you will transmit to YouTube to the broadcast that the video is for.
function bindBroadcast(broadcastId, streamId) {
    const path = buildUrl('liveBroadcasts/bind', {
        part: 'id,contentDetails',
        id: broadcastId,
        streamId: streamId,
    });
    const callOptions = { method: 'POST' };
    const response = fetchUrl(path, getToken_(), callOptions);
    console.log(response);
    return response;
}

function getStreams() {
    const path = buildUrl('liveStreams', { part: 'snippet,cdn', mine: 'true' });
    const callOptions = { method: 'GET' };
    const response = fetchPage(path, getToken_(), callOptions, 'items');
    const streams = response.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        key: item.cdn.ingestionInfo.streamName,
    }));
    console.log(streams);
    return streams;
}
