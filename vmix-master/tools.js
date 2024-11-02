// ===== Box Utils =====
function getBoxes() {
    return Array.from(document.querySelectorAll('.box'));
}

function getBox(num) {
    return document.getElementsByClassName('box')[num - 1];
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
function show(str, isError = false) {
    const logs = document.getElementById('logs');
    logs.innerHTML =
        `
        <p ${isError ? 'class="text-error"' : ''}>${new Option(str).innerHTML}</p>
        <div class="divider"></div>` + logs.innerHTML;
}

function showError(str) {
    show(str, true);
}

// ===== vMix API Utils =====
function getApiUrl(host, request) {
    const fullHost = host.includes(':') ? host : host + ':8088';
    return 'http://' + fullHost + '/api/?' + request;
}

async function fetchUrl(url) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        const data = await response.text();
        return {
            status: response.status,
            value: data,
            error: null,
        };
    } catch (error) {
        return {
            status: null,
            value: null,
            error: error,
        };
    }
}

async function execute(url, isShow = true) {
    const res = await fetchUrl(url);
    const timestamp = new Date().toLocaleTimeString();
    const message = res.status
        ? `[${timestamp}] ${url} Status ${res.status}: ${res.value.slice(0, 300)}`
        : '';
    if (isShow) {
        if (res.status === 200) {
            show(message);
        } else if (res.status !== null) {
            showError(message);
        } else {
            showError(`[${timestamp}] Error ${url}`, res.error);
        }
    }
}

// ===== General Purpose Utils ====
function getShortTitle(str, len = 20) {
    return str.length > len ? str.slice(0, len / 2) + '...' + str.slice(-len / 2) : str;
}

function parseNumbers(str) {
    return str
        .split(' ')
        .map((num) => num.trim())
        .filter((num) => num !== '')
        .map((num) => parseInt(num));
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
