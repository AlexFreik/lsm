const DELAY_PARAM = 'd';
const VIDEO_ID_PARAM = 'v';

const SKIP_MARGIN = 30;
const START_MARGIN = 30;
const SKIP_CORRECTION = 5;
const STREAM_DURATION_CORRECTION = 3600;

const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';
const DEFAULT_DELAY = 900;
const MINIMAL_DELAY = 60;

const player = {
    ytPlayer: null,
    isReady: false,
    startingDuration: -100,
    startingDate: -100,
    videoId: '',
    delay: -100,
    savedDelay: -100,
};

function getVideoId() {
    return document.getElementById('videoId').value;
}

function getDelay() {
    const delay = parseInt(document.getElementById('delay').value);
    console.assert(delay >= MINIMAL_DELAY);
    if (delay < MINIMAL_DELAY) {
        console.error("Delay shouldn't be less then minimal delay: " + MINIMAL_DELAY);
        return MINIMAL_DELAY;
    }
    return delay;
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
}

function loadPlayer() {
    const playerElem = document.getElementById('player');
    playerElem.src = `https://www.youtube-nocookie.com/embed/${player.videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3`;
}

async function loadNewVideo() {
    player.isReady = false;

    player.videoId = getVideoId();
    player.delay = getDelay();
    player.savedDelay = player.delay;

    await player.ytPlayer.loadVideoById({ videoId: player.videoId });

    // Update the URL without triggering a full page reload
    var stateObj = { videoId: player.videoId, delay: player.delay };
    var newUrl =
        window.location.href.split('?')[0] +
        `?${VIDEO_ID_PARAM}=${player.videoId}&${DELAY_PARAM}=${player.delay}`;
    history.pushState(stateObj, '', newUrl);
    // location.replace(newUrl);
}

function loadPlayerAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    player.ytPlayer = new YT.Player('player', {
        events: {
            onReady: loadNewVideo,
            onStateChange: onPlayerStateChange,
        },
    });
}

function getCurrentDate() {
    return new Date().getTime() / 1000;
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        const duration = player.ytPlayer.getDuration() - STREAM_DURATION_CORRECTION;
        // if duration is the same as current one, it means
        // that player wasn't reloaded, so we don't need to update timings
        if (Math.abs(duration - player.startingDuration) > 10) {
            player.startingDate = getCurrentDate();
            player.startingDuration = duration;
            console.log('Player started. Duration:', player.startingDuration);
            loadNewVideo();
        }
        player.isReady = true;
    }
}

function getActualDuration() {
    if (player.startingDuration <= 0) {
        console.error('Invalid duration:', player.startingDuration);
        return 0;
    }
    if (player.startingDate <= 0) {
        console.error('Invalid time:', player.startingDate);
        return 0;
    }
    const ans = player.startingDuration + (getCurrentDate() - player.startingDate);

    if (ans <= 0) {
        console.error('Invalid actual duration:', ans);
        return 0;
    }
    return ans;
}

function seekDelay(delay) {
    if (isNaN(delay)) {
        console.error('Delay should be a positive number, but it is: ' + delay);
        return;
    }
    console.assert(delay >= MINIMAL_DELAY);
    const newTime = getActualDuration() - delay;
    console.log('Seeking to a new delay: ' + delay + ', at time:' + newTime);
    player.ytPlayer.seekTo(newTime);
    player.isReady = false;
}

function updateDelay() {
    const newDelayElem = document.getElementById('new-delay');
    let newDelay = parseInt(newDelayElem.value);
    console.log(newDelay);
    if (newDelay < MINIMAL_DELAY) newDelay = MINIMAL_DELAY;
    seekDelay(newDelay);
}

function adjustDelay(val) {
    const currentDelay = getActualDuration() - player.ytPlayer.getCurrentTime();
    let newDelay = currentDelay + val;
    if (newDelay < MINIMAL_DELAY) newDelay = MINIMAL_DELAY;
    seekDelay(newDelay);
}

function renderStats(duration, delay) {
    const durationElem = document.getElementById('duration-stat');
    const delayElem = document.getElementById('delay-stat');

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

setInputsFromUrlParams();

player.videoId = getVideoId();
player.delay = getDelay();
player.savedDelay = player.delay;

loadPlayer();
loadPlayerAPI();

setInterval(() => {
    // First 30min after stream started player.getDuration() will always return 3600
    if (!player.isReady || player.startingDuration === 0) {
        return;
    }

    console.assert(player.videoId, !isNaN(player.delay), !isNaN(player.savedDelay));
    const actualDuration = getActualDuration();
    const currentTime = player.ytPlayer.getCurrentTime();
    console.assert(!isNaN(actualDuration));

    if (isNaN(currentTime) || currentTime < START_MARGIN || actualDuration < player.delay) {
        return;
    }
    const currentDelay = actualDuration - currentTime;
    console.assert(currentDelay > -10, 'Invalid current delay: ' + currentDelay);

    renderStats(actualDuration, currentDelay);

    if (currentDelay >= MINIMAL_DELAY) {
        if (Math.abs(player.savedDelay - currentDelay) < 2) {
            return;
        }
        player.savedDelay = currentDelay;
        console.log('New saved delay:', currentDelay);
    } else if (currentDelay > SKIP_MARGIN) {
        if (Math.abs(player.savedDelay - MINIMAL_DELAY) < 2) {
            return;
        }
        player.savedDelay = MINIMAL_DELAY;
        console.log('New saved delay:', MINIMAL_DELAY);
    } else {
        console.log('Current delay was: ' + currentDelay + ', saved delay: ' + player.savedDelay);
        seekDelay(player.savedDelay + SKIP_CORRECTION);
    }
}, 1000);
