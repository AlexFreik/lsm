function getUrlParameters() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        params.push({ key: key, value: value });
    });
    return params;
}

function updateUrlParameters() {
    const newParams = new URLSearchParams();
    document.querySelectorAll('.box').forEach((box) => {
        newParams.append(getVideoName(box), getVideoId(box));
    });
    const paramString = newParams.toString();
    window.history.pushState({}, '', `?${paramString}`);
}

getUrlParameters().forEach((param) => {
    addBox(param.key, param.value);
});

function addBox(name = 'Name', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(getBox(name, videoId), gallery.lastElementChild);
}

function getBox(name, videoId) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `<div class="video-header"
        ><label 
            class="input-sizer"
            style="font-size: 18px; font-weight: bold;"
            ><input
                type="text"
                onInput="this.parentNode.dataset.value = this.value;"
                onblur="updateUrlParameters();"
                size="5"
                placeholder="Name"
                value="${name}"
                class="video-name"
        /></label>
        -
        <label 
            class="input-sizer"
            style="font-size: 14px;"
            ><input
                type="text"
                onInput="this.parentNode.dataset.value = this.value;"
                onblur="updateUrlParameters();"
                size="10"
                placeholder="Video ID"
                value="${videoId}"
                class="video-id"
        /></label
    ></div
    ><div class="embed-container"
        ><button class="top-btn refresh-btn" onclick="refreshVideo(this)">Refresh</button
        ><button class="top-btn close-btn" onclick="removeVideo(this)">Close</button
    ></div>`;
    const parent1 = box.firstChild.firstChild;
    const input1 = parent1.firstChild;
    const parent2 = box.firstChild.lastChild;
    const input2 = parent2.firstChild;
    parent1.dataset.value = input1.value;
    parent2.dataset.value = input2.value;
    if (videoId) {
        box.lastChild.appendChild(getYouTubePlayer(videoId));
    }
    return box;
}

function refreshVideo(btn) {
    const box = btn.parentNode.parentNode;
    const videoId = getVideoId(box);
    box.lastChild.removeChild(box.lastChild.lastChild);
    box.lastChild.appendChild(getYouTubePlayer(videoId));
}
function removeVideo(btn) {
    const box = btn.parentNode.parentNode;
    box.parentNode.removeChild(box);
    updateUrlParameters();
}

function getVideoName(box) {
    return box.firstChild.firstChild.firstChild.value;
}

function getVideoId(box) {
    return box.firstChild.lastChild.firstChild.value;
}

function getYouTubePlayer(videoId) {
    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&iv_load_policy=3`;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowfullscreen = true;
    return iframe;
}

function toggleEditable() {
    const inputs = document.querySelectorAll('.editable-input');

    inputs.forEach((input) => {
        input.readOnly = !input.readOnly;
    });
}

// Add a click event listener to the parent div to toggle editable state on click
const rowElement = document.querySelector('.row');
rowElement.addEventListener('click', toggleEditable);
