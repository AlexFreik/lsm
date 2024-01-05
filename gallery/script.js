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
    document.querySelectorAll('.video-header').forEach((h5, index) => {
        const key = h5.firstChild.firstChild.value;
        const value = h5.lastChild.firstChild.value;
        newParams.append(key, value);
    });
    const paramString = newParams.toString();
    window.history.pushState({}, '', `?${paramString}`);
}

getUrlParameters().forEach((param) => {
    addItem(param.key, param.value);
});

function addItem(name = 'Name', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(getContainer(name, videoId), gallery.lastElementChild);
}

function getContainer(name, videoId) {
    const container = document.createElement('div');
    container.className = 'col-lg-3 col-md-6 col-sm-12 mb-3';
    container.innerHTML = `<div class="video-header"><label 
                class="input-sizer"
                style="font-size: 18px; font-weight: bold;"
                    ><input
                        type="text"
                        onInput="this.parentNode.dataset.value = this.value;"
                        onblur="updateUrlParameters();"
                        size="5"
                        placeholder="Name"
                        value="${name}"
                        class="video-name"/></label>
                -
                <label class="input-sizer"><input
                        type="text"
                        onInput="this.parentNode.dataset.value = this.value;"
                        onblur="updateUrlParameters();"
                        size="10"
                        placeholder="Video ID"
                        value="${videoId}"
                        class="video-id"/></label></div><div class="embed-container"></div>`;
    const parent1 = container.firstChild.firstChild;
    const input1 = parent1.firstChild;
    const parent2 = container.firstChild.firstChild;
    const input2 = parent2.lastChild;
    parent1.dataset.value = input1.value;
    parent2.dataset.value = input2.value;
    if (videoId) {
        container.children[1].appendChild(getYouTubePlayer(videoId));
    }
    return container;
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
