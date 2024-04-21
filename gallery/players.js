function getPlayer(type, videoId, boxId) {
    console.assert(boxId);
    if (type === 'CU' || type === '' || videoId === '') {
        return getCustomPlayer(videoId);
    } else if (type === 'YN') {
        return getYouTubePlayer(videoId, boxId, false);
    } else if (type === 'ZO') {
        return getZoomPlayer(videoId, boxId);
    } else if (type === 'JW') {
        return getJWPlayer(videoId, boxId);
    } else if (type === 'FB') {
        return getFacebookPlayer(videoId, boxId);
    } else if (type === 'IG') {
        return getInstagramPlayer(videoId, boxId);
    } else if (type === 'YT') {
        return getYouTubePlayer(videoId, boxId, true);
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

function getYouTubePlayer(videoId, boxId, cookies) {
    const iframe = document.createElement('iframe');
    const host = cookies ? 'youtube' : 'youtube-nocookie';

    const autoLive = document.getElementById('autoLive').checked ? '1' : '0';
    console.assert(autoLive);

    iframe.src = `https://www.${host}.com/embed/${videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3&boxId=${boxId}&autoLive=${autoLive}`;
    iframe.title = 'YouTube Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;';
    iframe.allowfullscreen = 'true';
    return iframe;
}

function getZoomPlayer(videoId, boxId) {
    const iframe = document.createElement('iframe');
    const [id, pwd, tk] = videoId.split('&');
    console.assert(id);

    const blink = document.getElementById('zoomBlink').checked ? '1' : '0';
    console.assert(blink);

    const beep = document.getElementById('zoomBeep').checked ? '1' : '0';
    console.assert(beep);

    const sdk = document.getElementById('zoomSdkKey').value;
    console.assert(sdk);

    const auth = document.getElementById('zoomAuthEndpoint').value;
    console.assert(auth);

    iframe.src = `../zoom-sdk?id=${id}&tk=${tk ? tk : ''}&pwd=${pwd ? pwd : ''}&boxId=${boxId}&sdk=${sdk}&auth=${auth}&blink=${blink}&beep=${beep}`;
    iframe.title = 'Zoom Web SDK Client';
    iframe.allow = 'camera; microphone;';
    return iframe;
}

function getJWPlayer(videoId, boxId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.controlhub.innerengineering.vualto.com/Player/Index/${videoId}?viewUnpublished=True&boxId=${boxId}`;
    iframe.title = 'JWP';
    iframe.seamless = 'seamless';
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; autoplay; fullscreen; clipboard-read; clipboard-write;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getFacebookPlayer(videoId, boxId) {
    const [channel, video] = videoId.split('&');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.facebook.com/video/embed?video_id=${videoId}$boxId=${boxId}`;
    iframe.className = 'fb-video';
    iframe.frameborder = '0';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    iframe.allowfullscreen = 'true';
    iframe.setAttribute('allowFullScreen', 'true');
    return iframe;
}

function getInstagramPlayer(videoId, boxId) {
    const player = document.createElement('iframe');
    return player;
}

export { getPlayer };
