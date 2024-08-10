function getName(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('name-input')[0].value;
}

function getHost(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('host-input')[0].value;
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
    document.querySelectorAll('.box').forEach((box) => {
        const key = getName(box);
        const val = getHost(box);
        if (key === '') return;
        boxParams.append(key, val);
    });
    const configParams = parseDocumentConfig();
    window.history.pushState({}, '', `?${boxParams.toString()}&${configParams.toString()}`);
}

function show(str, isError = false) {
    const logs = document.getElementById('logs');
    logs.innerHTML =
        `
        <p ${isError ? 'class="text-error"' : ''}>
            ${str}
        </p>
        <div class="divider"></div>` + logs.innerHTML;
}

function showError(str) {
    show(str, true);
}

async function executeAndShow(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();

        const timestamp = new Date().toLocaleTimeString();
        const message = `[${timestamp}] ${url} Status ${response.status}. ${data.slice(0, 300)}`;
        if (response.ok) {
            show(message);
        } else {
            showError(message);
        }
    } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        showError(`[${timestamp}] Error ${url}`, error);
    }
    return [];
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

export { getConfigUrlParams, getBoxUrlParams, updateUrlParams, executeAndShow, xml2json };
