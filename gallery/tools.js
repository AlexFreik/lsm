import { getVideoName, getVideoId, getType } from './box-controls.js';

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

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUUID() {
    return (Math.random() + 1).toString(36).substring(2);
}

export { getUrlParameters, updateUrlParameters, capitalizeFirst, generateUUID };
