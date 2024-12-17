const LOG_SIZE = 500;

// ===== Box Utils =====
function getBoxes() {
    return Array.from(document.querySelectorAll('.box'));
}

function getBox(num) {
    console.assert(num === null || Number.isInteger(num));
    const boxes = getBoxes();
    if (!Number.isInteger(num) || num < 1 || num > boxes.length) {
        return null;
    }
    return boxes[num - 1];
}

function getBoxCount() {
    return document.getElementsByClassName('box').length;
}

function getBoxNumber(box) {
    console.assert(box.classList.contains('box'));
    return parseInt(box.querySelector('.box-number').innerHTML);
}

function getBoxName(box) {
    console.assert(box.classList.contains('box'));
    return box.querySelector('.name-input').value;
}

function getBoxHost(box) {
    console.assert(box.classList.contains('box'));
    return box.querySelector('.host-input').value;
}

function getBoxVmixInfo(box) {
    console.assert(box.classList.contains('box'));
    return getVmixInfo(getBoxNumber(box));
}

// ===== Document Config & Box URL Utils =====
function getDocumentConfig() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append('__' + input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text' || input.type === 'number') {
            params.append('__' + input.id, input.value);
        } else {
            console.error('Unexpected type: ' + input.type);
        }
    });
    return params;
}

function setInputValue(id, value) {
    const input = document.getElementById(id, value);
    console.assert(input !== null, 'Can\'t find element with ID "' + id + '"');
    if (input === null) {
        return;
    }

    if (input.type === 'checkbox') {
        console.assert(['0', '1'].includes(value));
        input.checked = value === '1';
    } else if (input.type === 'text' || input.type === 'number') {
        input.value = value;
    } else {
        console.error('Unknown input type: ' + input.type);
    }
}

function updateDocumentConfig() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => setInputValue(param.key, param.value));
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

function getBoxUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach((value, key) => {
        if (key === '' || key.startsWith('__')) return;
        params.push({ key: key, value: value });
    });
    return params;
}

function updateUrlParams() {
    const boxParams = new URLSearchParams();
    getBoxes().forEach((box) => {
        const key = getBoxName(box);
        const val = getBoxHost(box);
        if (key === '') return;
        boxParams.append(key, val);
    });
    const configParams = getDocumentConfig();
    window.history.pushState({}, '', `?${boxParams.toString()}&${configParams.toString()}`);
}

// ===== Logging Utils =====
function show(header, msg, isError = false) {
    const logs = document.querySelector('.logs');
    logs.innerHTML =
        `
        <div class="divider mb-1 mt-3 text-secondary">
          ${getShortText(header, 80)}
        </div>
        <p ${isError ? 'class="text-error"' : ''}>${new Option(msg).innerHTML}</p>` +
        logs.innerHTML;
}

function showError(header, msg) {
    show(header, msg, true);
}

function showLog(url, status, value, error, time) {
    const message = `[${time}]: ` + (value ? getShortText(value, 300) : 'Error');
    if (status === 200) {
        show(url, message);
    } else {
        showError(url, message);
    }
}

function storeLog(url, status, value, error, time) {
    const logs = localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [];
    logs.unshift({ time: time, url: url, status, value: value, error: error });
    localStorage.setItem('logs', JSON.stringify(logs.slice(0, LOG_SIZE)));
}

function showStoredLogs() {
    const logs = localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [];
    logs.reverse().forEach((log) => showLog(log.url, log.status, log.value, log.error, log.time));
}

// ===== General Purpose Utils =====
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function removeDuplicates(arr) {
    return arr.filter((val, i) => arr.indexOf(val) === i);
}

function getShortText(str, len) {
    return str.length > len ? str.slice(0, len / 2) + '...' + str.slice(-len / 2) : str;
}

function getResponsiveTitle(str) {
    let splitIndex = Math.ceil(str.length * 0.5);
    while (splitIndex < str.length && !/[a-zA-Z0-9]/.test(str[splitIndex])) {
        splitIndex++;
    }
    const left = str.slice(0, splitIndex);
    const right = str.slice(splitIndex);
    return (
        `<span class="overflow-hidden whitespace-nowrap text-ellipsis">${left}</span>` +
        `<span class="overflow-hidden whitespace-nowrap text-clip" style="direction: rtl">${right}</span>`
    );
}

function parseNumbers(str) {
    return str
        .split(' ')
        .map((num) => num.trim())
        .filter((num) => num !== '')
        .map((num) => parseInt(num));
}

function ensureArray(element) {
    if (element === undefined) return [];
    if (Array.isArray(element)) {
        return element;
    } else {
        return [element];
    }
}

function xml2json(xml) {
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj['@attributes'] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) {
        // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == 'undefined') {
                obj[nodeName] = xml2json(item);
            } else {
                if (typeof obj[nodeName].push == 'undefined') {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xml2json(item));
            }
        }
    }
    return obj;
}
