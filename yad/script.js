DELAY_PARAM_NAME = 'd';
VIDEO_ID_PARAM_NAME = 'v';
MINIMAL_DELAY_MARGIN = 60;
MAXIMAL_DELAY_MARGIN = 3600;
LIVESTREAM_DURATION_CORRECTION = 3600;

DEFAULT_VIDEO_ID = 'jfKfPfyJRdk';
DEFAULT_DELAY = 900;

function getParameterByName(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setInputsFromUrlParams() {
    videoIdParam = getParameterByName(VIDEO_ID_PARAM_NAME) || DEFAULT_VIDEO_ID;
    document.getElementById('videoId').value = videoIdParam;

    delayParam = getParameterByName(DELAY_PARAM_NAME) || DEFAULT_DELAY;
    document.getElementById('delay').value = delayParam;
}

async function configurePlayer() {
    videoId = document.getElementById('videoId').value;
    delay = document.getElementById('delay').value;
    await player.loadVideoById({ videoId: videoId });

    // Update the URL without triggering a full page reload
    var stateObj = { videoId: videoId, delay: delay };
    var newUrl =
        window.location.href.split('?')[0] +
        `?${VIDEO_ID_PARAM_NAME}=${videoId}&${DELAY_PARAM_NAME}=${delay}`;
    history.pushState(stateObj, '', newUrl);
}

function loadPlayerAPI() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
}

function onPlayerReady(event) {
    configurePlayer();
    event.target.playVideo();
}

function getSystemCurrentTime() {
    return Math.floor(new Date().getTime() / 1000);
}
/**
 * Checks if current video time is close enough to the perfect time.
 *
 * If perfect time is not set returns true.
 *
 * @returns {boolean} true if video is playing at the right time
 */
function isVideoCurrentTimeGood() {
    var currentTime = Math.floor(player.getCurrentTime());
    var perfectTime = getPerfectTime();
    if (perfectTime === 0) {
        console.error('Invalid perfect time:', perfectTime);
        return true;
    }
    return (
        -MAXIMAL_DELAY_MARGIN < currentTime - perfectTime &&
        currentTime - perfectTime < MINIMAL_DELAY_MARGIN
    );
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlayerReady = true;
        duration =
            Math.floor(player.getDuration()) - LIVESTREAM_DURATION_CORRECTION;
        // if duration is the same as current one, it means
        // that player wasn't reloaded, so we don't need to update timings
        console.log(
            systemTimeWhenStarted,
            durationWhenStarted,
            duration,
            !(Math.abs(duration - durationWhenStarted) < 1),
        );
        if (!(Math.abs(duration - durationWhenStarted) < 1)) {
            systemTimeWhenStarted = getSystemCurrentTime();
            durationWhenStarted = duration;
        }

        console.log(
            'Player started. Duration:',
            durationWhenStarted,
            ', system time:',
            systemTimeWhenStarted,
            ', isGood:',
            isVideoCurrentTimeGood(),
        );
    }
}

function getActualDuration() {
    if (!(durationWhenStarted > 0)) {
        console.error('Invalid duration:', durationWhenStarted);
        return 0;
    }
    if (!(systemTimeWhenStarted > 0)) {
        console.error('Invalid time:', systemTimeWhenStarted);
        return 0;
    }
    return getSystemCurrentTime() - systemTimeWhenStarted + durationWhenStarted;
}

function getPerfectTime() {
    const actualDuration = getActualDuration();
    if (actualDuration === 0) {
        console.error('Invalid actual duration:', actualDuration);
        return 0;
    }
    return getActualDuration() - delay;
}

var player;
// duration of video when it was loaded in player
// (it doesn't get auto updated for live streams)
var durationWhenStarted;
// system timestamp when duration was set ()
var systemTimeWhenStarted;
var intervalId = -1;
var videoId = getParameterByName(VIDEO_ID_PARAM_NAME);
var delay = getParameterByName(DELAY_PARAM_NAME);
var isPlayerReady = false;
setInputsFromUrlParams();

loadPlayerAPI();

intervalId = setInterval(() => {
    if (isPlayerReady && !isVideoCurrentTimeGood()) {
        var perfectTime = getPerfectTime();
        console.log('Seeking to:', perfectTime);
        player.seekTo(perfectTime);
        isPlayerReady = false;
    }
}, 1000);
