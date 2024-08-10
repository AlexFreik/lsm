const VIDEO_ID_PARAM = 'v';
const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';

function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setInputsFromUrlParams() {
    const videoIdParam = getUrlParam(VIDEO_ID_PARAM) || DEFAULT_VIDEO_ID;
    document.getElementById('videoId').value = videoIdParam;
}

function updateDelay() {
    const newDelayElem = document.getElementById('new-delay');
    connection.postMessage(JSON.stringify({ type: 'NEW_DELAY', value: newDelayElem.value }));
}

function getVideoId() {
    return document.getElementById('videoId').value;
}

function adjustDelay(val) {
    connection.postMessage(JSON.stringify({ type: 'ADJUST_DELAY', value: val }));
}

function renderStats(duration, delay) {
    const durationElem = document.getElementById('duration-stat');
    const delayElem = document.getElementById('delay-stat');

    if (duration === -1 && delay === -1) {
        durationElem.innerHTML = '...';
        delayElem.innerHTML = '...';
        return;
    }

    const dur = duration | 0;
    const durationHours = (dur / 3600) | 0;
    const durationMinutes = ((dur / 60) | 0) % 60;
    const durationSeconds = dur % 60;
    durationElem.innerHTML = `${durationHours}h:${durationMinutes}m:${durationSeconds}s`;

    const del = delay | 0;
    const delayMinutes = (del / 60) | 0;
    const delaySeconds = del % 60;
    delayElem.innerHTML = `${delayMinutes}m:${delaySeconds}s (${del} s)`;
}

function changeConnection() {
    videoId = getVideoId();

    if (connection) connection.close();
    connection = getNewBroadcastChannel(videoId);
    duration = -1;
    delay = -1;
    renderStats(duration, delay);

    // Update the URL without triggering a full page reload
    var stateObj = { videoId: videoId, delay: delay };
    var newUrl = window.location.href.split('?')[0] + `?${VIDEO_ID_PARAM}=${videoId}`;
    history.pushState(stateObj, '', newUrl);
}

function getNewBroadcastChannel(videoId) {
    const bc = new BroadcastChannel(videoId);
    bc.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'STATS') {
            duration = msg.duration;
            delay = msg.delay;
            renderStats(duration, delay);
        }
    };
    return bc;
}

setInputsFromUrlParams();

let duration = -1;
let delay = -1;
let connection = getNewBroadcastChannel(getVideoId());
