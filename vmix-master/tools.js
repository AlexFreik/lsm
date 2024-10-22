function getBoxes() {
    return document.querySelectorAll('.box');
}

function getBoxName(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('name-input')[0].value;
}

function getBoxHost(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('host-input')[0].value;
}

function parseDocumentConfig() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append('__' + input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text' || input.type === 'number') {
            params.append('__' + input.id, input.value);
        } else {
            console.error('unexpected type: ' + input.type);
        }
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
    const configParams = parseDocumentConfig();
    window.history.pushState({}, '', `?${boxParams.toString()}&${configParams.toString()}`);
}

function getInputValue(id) {
    const input = document.getElementById(id);

    if (input.type === 'checkbox') {
        return input.checked;
    } else if (input.type === 'text' || input.type === 'number') {
        return input.value;
    } else {
        console.error('Unknown input type: ' + input.type);
        return null;
    }
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

function show(str, isError = false) {
    const logs = document.getElementById('logs');
    logs.innerHTML =
        `
        <p ${isError ? 'class="text-error"' : ''}>
            ${new Option(str).innerHTML}
        </p>
        <div class="divider"></div>` + logs.innerHTML;
}

function showError(str) {
    show(str, true);
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

async function executeAndShow(url) {
    const res = await fetchUrl(url);
    const timestamp = new Date().toLocaleTimeString();
    console.log(res.status);
    const message = res.status
        ? `[${timestamp}] ${url} Status ${res.status}: ${res.value.slice(0, 300)}`
        : '';
    if (res.status === 200) {
        show(message);
    } else if (res.status !== null) {
        showError(message);
    } else {
        showError(`[${timestamp}] Error ${url}`, res.error);
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

export {
    getBoxes,
    getBoxName,
    getBoxHost,
    getConfigUrlParams,
    getBoxUrlParams,
    updateUrlParams,
    fetchUrl,
    getInputValue,
    setInputValue,
    executeAndShow,
    xml2json,
};
