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
    startingDuration: -1,
    startingDate: -1,
    videoId: '',
    delay: -1,
    savedDelay: -1,
};

function getVideoId() {
    return document.getElementById('videoId').value;
}

function getDelay() {
    const delay = parseInt(document.getElementById('delay').value);
    console.assert(delay >= MINIMAL_DELAY);
    if (delay < MINIMAL_DELAY) {
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
    const newTime = getActualDuration() - delay - SKIP_CORRECTION;
    console.log('Seeking to a new delay:', delay, ', at time:', newTime);
    player.ytPlayer.seekTo(newTime);
    player.isReady = false;
}

setInputsFromUrlParams();

player.videoId = getVideoId();
player.delay = getDelay();
player.savedDelay = player.delay;

loadPlayer();
loadPlayerAPI();

setInterval(() => {
    if (!player.isReady) {
        return;
    }

    console.assert(player.videoId, !isNaN(player.delay), !isNaN(player.savedDelay));
    const actualDuration = getActualDuration();
    const currentTime = player.ytPlayer.getCurrentTime();
    console.assert(!isNaN(actualDuration));

    if (
        isNaN(currentTime) ||
        actualDuration < player.delay ||
        player.durationWhenStarted === 3600 ||
        currentTime < START_MARGIN
    ) {
        return;
    }
    const currentDelay = actualDuration - currentTime;
    console.assert(currentDelay > -10, 'Invalid current delay: ' + currentDelay);

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
        console.log('Current delay was: ' + currentDelay);
        seekDelay(player.savedDelay);
    }
}, 1000);
