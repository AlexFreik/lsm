var player;

function configurePlayer() {
    var videoId = document.getElementById('videoId').value;
    var delay = document.getElementById('delay').value;
    player.loadVideoById({ videoId: videoId });

    // Update the URL without triggering a full page reload
    var stateObj = { videoId: videoId, delay: delay };
    var newUrl =
        window.location.href.split('?')[0] +
        `?videoId=${videoId}&delay=${delay}`;
    history.pushState(stateObj, '', newUrl);

    console.log(
        'Configuring player with Video ID:',
        videoId,
        'and Delay:',
        delay,
    );
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
    event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(() => player.stopVideo(), 6000);
        done = true;
    }
}

loadPlayerAPI();
