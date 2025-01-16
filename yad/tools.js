function getCurrentDate() {
    return new Date().getTime() / 1000;
}

function extractYouTubeId(str) {
    try {
        const url = new URL(str);
        const vParam = url.searchParams.get('v');
        if (vParam) {
            // https://www.youtube.com/watch?v=12345
            return vParam;
        } else if (url.pathname.startsWith('/live/')) {
            // https://www.youtube.com/live/12345
            return url.pathname.slice(6);
        } else if (url.origin === 'https://youtu.be') {
            // https://youtu.be/12345
            return url.pathname.slice(1);
        } else {
            return str;
        }
    } catch (error) {
        return str;
    }
}

function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setInputsFromUrlParams() {
    const videoIdParam = getUrlParam(VIDEO_ID_PARAM) || DEFAULT_VIDEO_ID;
    document.getElementById('videoId').value = videoIdParam;

    const delayParam = getUrlParam(DELAY_PARAM) || DEFAULT_DELAY;
    document.getElementById('delay').value = delayParam;

    const privacyParam = getUrlParam(PRIVACY_PARAM) || DEFAULT_PRIVACY;
    document.getElementById('privacy').checked = privacyParam === '1';
}
