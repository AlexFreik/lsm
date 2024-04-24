import { parseDocumentConfig } from './tools.js';

function getPlayer(type, videoId, boxId) {
    console.assert(boxId);

    const config = new URLSearchParams();
    parseDocumentConfig().forEach((val, key) => config.append(key.substring(2), val));
    const urlParams = `boxId=${boxId}&${config.toString()}`;

    if (type === 'CU' || type === '' || videoId === '') {
        return getCustomPlayer(videoId);
    } else if (type === 'YN') {
        return getYouTubePlayer(videoId, urlParams, false);
    } else if (type === 'ZH') {
        return getZoomPlayer(videoId, urlParams, true);
    } else if (type === 'ZP') {
        return getZoomPlayer(videoId, urlParams, false);
    } else if (type === 'JW') {
        return getJWPlayer(videoId, urlParams);
    } else if (type === 'FB') {
        return getFacebookPlayer(videoId, urlParams);
    } else if (type === 'IG') {
        return getInstagramPlayer(videoId, urlParams);
    } else if (type === 'YT') {
        return getYouTubePlayer(videoId, urlParams, true);
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

function getYouTubePlayer(videoId, urlParams, cookies) {
    const iframe = document.createElement('iframe');
    const host = cookies ? 'youtube' : 'youtube-nocookie';

    iframe.src = `https://www.${host}.com/embed/${videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3&${urlParams}`;
    iframe.title = 'YouTube Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;';
    iframe.allowfullscreen = 'true';
    return iframe;
}

function getZoomPlayer(videoId, urlParams, isHost) {
    const iframe = document.createElement('iframe');
    const role = isHost ? '1' : '0';
    const [id, pwd, tk] = videoId.split('&');
    console.assert(id);

    iframe.src = `../zoom-sdk?id=${id}&tk=${tk ? tk : ''}&pwd=${pwd ? pwd : ''}&role={role}&${urlParams}`;
    iframe.title = 'Zoom Web SDK Client';
    iframe.allow = 'camera; microphone;';
    return iframe;
}

function getJWPlayer(videoId, urlParams) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.controlhub.innerengineering.vualto.com/Player/Index/${videoId}?viewUnpublished=True&${urlParams}`;
    iframe.title = 'JWP';
    iframe.seamless = 'seamless';
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; autoplay; fullscreen; clipboard-read; clipboard-write;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getFacebookPlayer(videoId, urlParams) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.facebook.com/video/embed?video_id=${videoId}&${urlParams}`;
    iframe.className = 'fb-video';
    iframe.frameborder = '0';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    iframe.allowfullscreen = 'true';
    iframe.setAttribute('allowFullScreen', 'true');
    return iframe;
}

function getInstagramPlayer(videoId, urlParams) {
    const player = document.createElement('iframe');
    return player;
}

export { getPlayer };
