function getPlayer(type, videoId) {
    if (type === 'CU' || type === '') {
        return getCustomPlayer(videoId);
    } else if (type === 'YT') {
        return getYouTubePlayer(videoId, true);
    } else if (type === 'YN') {
        return getYouTubePlayer(videoId, false);
    } else if (type === 'FB') {
        return getFacebookPlayer(videoId);
    } else if (type === 'IG') {
        return getInstagramPlayer(videoId);
    } else if (type === 'ZO') {
        return getZoomPlayer(videoId);
    } else {
        return getCustomPlayer('./404.html?description=Invalid video type');
    }
}

function getCustomPlayer(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = videoId;
    iframe.title = 'Custom Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share; fullscreen;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getYouTubePlayer(videoId, cookies) {
    const iframe = document.createElement('iframe');

    const host = cookies ? 'youtube' : 'youtube-nocookie';
    iframe.src = `https://www.${host}.com/embed/${videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3`;
    if (videoId === '') {
        iframe.src = '';
    }
    iframe.title = 'YouTube Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getFacebookPlayer(videoId) {
    const player = document.createElement('div');
    player.className = 'fb-video';
    player.setAttribute('data-href', 'https://www.facebook.com/facebook/videos/' + videoId);
    player.setAttribute('data-allowfullscreen', 'true');
    return player;
}

function getZoomPlayer(videoId) {
    const iframe = document.createElement('iframe');

    const [id, pwd] = videoId.split('&');
    iframe.src = `../zoom-sdk?id=` + id + '&pwd=' + pwd;
    if (videoId === '') {
        iframe.src = '';
    }
    iframe.title = 'Zoom Web SDK Client';
    iframe.allow = 'camera; microphone;';
    return iframe;
}

function getInstagramPlayer(videoId) {
    const player = document.createElement('iframe');
    player.className = 'fb-video';
    player.setAttribute('data-href', videoId);
    return player;
}

export { getPlayer };
