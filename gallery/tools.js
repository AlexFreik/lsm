function getRowName(row) {
    return row.querySelector('.row-name').value;
}

function getRowType(row) {
    return row.querySelector('.row-type').value;
}

function getRowValue(row) {
    return row.querySelector('.row-value').value;
}

function updateGalleryUrlInput() {
    document.getElementById('gallery-url').value = window.location.href;
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

function getConfigUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || !key.startsWith('__')) return;
        params.push({ key: key.substring(2), value: value });
    });
    return params;
}

function parseDocumentConfig() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append('__' + input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text') {
            params.append('__' + input.id, input.value);
        } else {
            conole.error('unexpected type: ' + input.type);
        }
    });
    return params;
}

function updateUrlParams() {
    const rowParams = new URLSearchParams();
    document.querySelectorAll('.row').forEach((row) => {
        const key = getRowName(row);
        const val = getRowType(row) + getRowValue(row);
        if (key === '') return;
        rowParams.append(key, val);
    });
    const configParams = parseDocumentConfig();
    window.history.pushState({}, '', `?${rowParams.toString()}&${configParams.toString()}`);
    updateGalleryUrlInput();
}

function extractYouTubeId(str) {
    try {
        const url = new URL(str);
        const vParam = url.searchParams.get('v');
        if (vParam) {
            // https://www.youtube.com/watch?v=12345
            return vParam;
        } else if (url.pathname.startsWith('/live/')) {
            // https://www.youtube.com/live/12345
            return url.pathname.slice(6);
        } else if (url.origin === 'https://youtu.be') {
            // https://youtu.be/12345
            return url.pathname.slice(1);
        } else {
            return str;
        }
    } catch (error) {
        return str;
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUUID() {
    return (Math.random() + 1).toString(36).substring(2);
}

async function getAvailableMics() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
        return audioInputDevices;
    } catch (error) {
        console.error('Error accessing microphones:', error);
        alert('Could not access microphones. Please grant permissions.');
        return [];
    }
}

export {
    getRowName,
    getRowType,
    getRowValue,
    getBoxUrlParams,
    getConfigUrlParams,
    parseDocumentConfig,
    updateUrlParams,
    generateUUID,
    extractYouTubeId,
    updateGalleryUrlInput,
    getAvailableMics,
};
