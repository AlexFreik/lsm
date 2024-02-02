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
        const val = getVideoId(box);
        if (key === '') return;
        newParams.append(key, val);
    });
    const paramString = newParams.toString();
    window.history.pushState({}, '', `?${paramString}`);
}

getUrlParameters().forEach((param) => {
    addBox(param.key, param.value);
});

function addBox(name = '', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(createBox(name, videoId), gallery.lastElementChild);
}

function createBox(name, videoId) {
    const box = document.createElement('div');
    box.className = 'box';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.onblur = () => updateUrlParameters();
    nameInput.size = '10';
    nameInput.placeholder = 'Name';
    nameInput.value = name;
    nameInput.className = 'video-name';
    box.appendChild(nameInput);

    const videoIdInput = document.createElement('input');
    videoIdInput.type = 'text';
    videoIdInput.onblur = () => updateUrlParameters();
    videoIdInput.size = '14';
    videoIdInput.placeholder = 'Video ID';
    videoIdInput.value = videoId;
    videoIdInput.className = 'video-id';
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

    embedContainer.appendChild(getYouTubePlayer(videoId));
    return box;
}

function refreshVideo(btn) {
    const box = btn.parentNode.parentNode;
    const embedContainer = box.lastChild;
    const iframe = embedContainer.lastChild;

    console.assert(iframe.tagName === 'IFRAME');
    embedContainer.removeChild(iframe);

    const videoId = getVideoId(box);
    embedContainer.appendChild(getYouTubePlayer(videoId));
}
function removeVideo(btn) {
    const box = btn.parentNode.parentNode;
    box.parentNode.removeChild(box);
    updateUrlParameters();
}

function getVideoName(box) {
    console.assert(box.classList.contains('box'));
    return box.firstChild.value;
}

function getVideoId(box) {
    console.assert(box.classList.contains('box'));
    return box.children[1].value;
}

function getYouTubePlayer(videoId) {
    const iframe = document.createElement('iframe');
    iframe.width = '290';
    iframe.height = '150';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3`;
    if (videoId === '') {
        iframe.src = '';
    }
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowfullscreen = true;
    return iframe;
}
