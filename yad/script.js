DELAY_PARAM_NAME = 'delay';
VIDEO_ID_PARAM_NAME = 'videoId';
DELAY_MARGIN = 60;

function getParameterByName(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setInputsFromUrlParams() {
    videoIdParam = getParameterByName(VIDEO_ID_PARAM_NAME) || 'jfKfPfyJRdk';
    document.getElementById('videoId').value = videoIdParam;

    delayParam = getParameterByName(DELAY_PARAM_NAME) || '900';
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
        `?videoId=${videoId}&delay=${delay}`;
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

function isVideoCurrentTimeGood() {
    var currentTime = Math.floor(player.getCurrentTime());
    var perfectTime = calculateVideoDelayedTime();
    if (perfectTime === 0) {
        console.error('Invalid perfect time:', perfectTime);
    }
    return (currentTime - perfectTime) < DELAY_MARGIN && (currentTime - perfectTime) > -DELAY_MARGIN;
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlayerReady = true;
        systemTimeWhenStarted = getSystemCurrentTime();
        // for live streams player.getDuration() gives a much bigger time than actual duration
        durationWhenStarted = player.getDuration() - 3600;  

        console.log(calculateVideoDelayedTime(), player.getCurrentTime(), !isVideoCurrentTimeGood());
    }
}

function calculateVideoDelayedTime() {
    if (!(durationWhenStarted > 0) || !(systemTimeWhenStarted > 0)) {
        console.error('Invalid duration:', durationWhenStarted, 'or time:', systemTimeWhenStarted);
        return 0;
    }
    return (getSystemCurrentTime() - systemTimeWhenStarted) + (durationWhenStarted - delay);
}

var player;
// duration of video when it started playing in seconds 
// (it doesn't get auto updated for live streams)
var durationWhenStarted;  
var systemTimeWhenStarted;  // current time when video started in seconds
var intervalId = -1;
var videoId = getParameterByName(VIDEO_ID_PARAM_NAME);
var delay = getParameterByName(DELAY_PARAM_NAME);
var isPlayerReady = false;
setInputsFromUrlParams();

loadPlayerAPI();

intervalId = setInterval(() => {
    if (isPlayerReady && !isVideoCurrentTimeGood()) {
        var perfectTime = calculateVideoDelayedTime();
        console.log('Seeking to:', perfectTime);
        player.seekTo(perfectTime);
        isPlayerReady = false;
    }
}, 1000);