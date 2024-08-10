function getName(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('name-input')[0].value;
}

function getHost(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('host-input')[0].value;
}

function getBoxUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || key.startsWith('__')) return;
        params.push({ key: key, value: value });
    });
    return params;
}

function updateUrlParams() {
    const boxParams = new URLSearchParams();
    document.querySelectorAll('.box').forEach((box) => {
        const key = getName(box);
        const val = getHost(box);
        if (key === '') return;
        boxParams.append(key, val);
    });
    window.history.pushState({}, '', `?${boxParams.toString()}`);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export { getBoxUrlParams, updateUrlParams, capitalizeFirst };
