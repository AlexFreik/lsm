function getUrlParameters() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '') return;
        params.push({ key: key, value: value });
    });
    return params;
}

function updateUrlParameters() {
    const newParams = new URLSearchParams();
    document.querySelectorAll('.box').forEach((box) => {
        const key = getVideoName(box);
        const val = getType(box) + getVideoId(box);
        if (key === '') return;
        newParams.append(key, val);
    });
    const paramString = newParams.toString();
    window.history.pushState({}, '', `?${paramString}`);
}

function addBox(name = '', type = '', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(createBox(name, type, videoId), gallery.lastElementChild);
}

function createBox(name, type, videoId) {
    const box = document.createElement('div');
    box.className = 'box';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.onblur = () => updateUrlParameters();
    nameInput.placeholder = 'Name';
    nameInput.value = name;
    nameInput.className = 'video-name input input-bordered input-xs w-20 max-w-xs';
    box.appendChild(nameInput);

    const typeInput = document.createElement('select');
    typeInput.onblur = () => updateUrlParameters();
    typeInput.className = 'video-type select select-xs select-bordered w-16 max-w-xs ';
    const options = Array(5)
        .fill(null)
        .map((_) => document.createElement('option'));
    options.forEach((o) => typeInput.append(o));

    options[0].value = 'CU';
    options[0].text = 'CU (Custom)';
    options[0].selected = type === 'CU' || type === '';

    options[1].value = 'YT';
    options[1].text = 'YT (YouTube)';
    options[1].selected = type === 'YT';

    options[2].value = 'YN';
    options[2].text = 'YN (YouTube with enhanced privacy)';
    options[2].selected = type === 'YN';

    options[3].value = 'FB';
    options[3].text = 'FB (Facebook)';
    options[3].selected = type === 'FB';

    options[4].value = 'IG';
    options[4].text = 'IG (Instagram)';
    options[4].selected = type === 'IG';

    options[4].value = 'ZO';
    options[4].text = 'ZO (Zoom)';
    options[4].selected = type === 'IG';

    box.appendChild(typeInput);

    const videoIdInput = document.createElement('input');
    videoIdInput.type = 'text';
    videoIdInput.onblur = () => updateUrlParameters();
    videoIdInput.placeholder = 'Video ID';
    videoIdInput.value = videoId;
    videoIdInput.className = 'video-id input input-bordered input-xs w-24 max-w-xs';
    box.appendChild(videoIdInput);

    const embedContainer = document.createElement('div');
    embedContainer.className = 'embed-container';
    box.appendChild(embedContainer);

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'top-btn refresh-btn';
    refreshBtn.onclick = () => refreshVideo(refreshBtn);
    refreshBtn.appendChild(document.createTextNode('Refresh'));
    embedContainer.appendChild(refreshBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'top-btn close-btn';
    closeBtn.onclick = () => removeVideo(closeBtn);
    closeBtn.appendChild(document.createTextNode('Close'));
    embedContainer.appendChild(closeBtn);

    embedContainer.appendChild(getPlayer(type, videoId));
    return box;
}

function refreshVideo(btn) {
    const box = btn.parentNode.parentNode;
    const embedContainer = box.lastChild;
    const player = embedContainer.lastChild;

    embedContainer.removeChild(player);

    const type = getType(box);
    const videoId = getVideoId(box);
    embedContainer.appendChild(getPlayer(type, videoId));
}
function removeVideo(btn) {
    const box = btn.parentNode.parentNode;
    box.parentNode.removeChild(box);
    updateUrlParameters();
}

function getVideoName(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-name')[0].value;
}

function getVideoId(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-id')[0].value;
}

function getType(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-type')[0].value;
}

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
    } else {
        console.error('Unknown player type: ' + type);
        return getCustomPlayer('');
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

function getInstagramPlayer(videoId) {
    const player = document.createElement('iframe');
    player.className = 'fb-video';
    player.setAttribute('data-href', videoId);
    return player;
}

function initBoxes() {
    const urlParams = getUrlParameters();
    if (urlParams.length === 0) {
        addBox('', 'YN', '');
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

initBoxes();
