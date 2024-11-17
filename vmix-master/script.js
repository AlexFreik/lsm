function addBox(name = '', host = '') {
    const boxes = document.getElementById('boxes');
    boxes.appendChild(createBox(name, host, getBoxCount() + 1));
}

function initBoxes() {
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addBox();
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value);
    });
}

function customExecution(request) {
    const include = parseNumbers(document.getElementById('include').value);
    getBoxes()
        .filter((box) => include.includes(getBoxNumber(box)))
        .forEach((box) => execute(getApiUrl(getBoxHost(box), request)));
}

async function refreshInstance(box) {
    const num = getBoxNumber(box);
    const host = getBoxHost(box);
    if (host === '') {
        setVmixInfo(num, null);
    } else {
        setVmixInfo(num, await fetchVmixInfo(host));
    }
    renderVmixInfo(box);
    if (num === getMaster()) {
        renderVmixWeb();
    }
}

async function refreshInstances(cnt = 0) {
    if (cnt === 0 && refreshRate !== -1) {
        getBoxes().forEach(async (box) => refreshInstance(box));
    }

    const masterBox = getBox(getMaster());
    if (cnt !== 0 && masterBox !== null) {
        refreshInstance(masterBox);
    } else if (masterBox === null) {
        renderVmixWeb();
    }

    await sleep(1000);
    requestAnimationFrame(() => refreshInstances((cnt + 1) % refreshRate));
}

function setVmixButtons() {
    const disabled = document.getElementById('view-mode').checked;
    document
        .getElementById('custom-commands-container')
        .querySelectorAll('button')
        .forEach((btn) => {
            if (disabled) {
                btn.disabled = true;
            } else {
                btn.removeAttribute('disabled');
            }
        });
    document
        .getElementById('vmix-container')
        .querySelectorAll('button')
        .forEach((btn) => {
            if (disabled) {
                btn.disabled = true;
            } else {
                btn.removeAttribute('disabled');
            }
        });
}

function setMixerVisibility() {
    const show = document.getElementById('show-mixer').checked;
    const mixerElem = document.getElementById('vmix-mixers');
    if (show) {
        mixerElem.classList.remove('hidden');
    } else {
        mixerElem.classList.add('hidden');
    }
}

function updateRefreshRates() {
    const val1 = document.getElementById('refresh-rate').value;
    refreshRate = val1 === '' ? -1 : Math.max(1, val1);
}

let refreshRate = -1;
const vmixInfos = [];

(() => {
    updateDocumentConfig();
    initBoxes();
    showStoredLogs();
    prerenderVmixWeb();
    setVmixButtons();
    setMixerVisibility();

    document
        .querySelectorAll('.url-param')
        .forEach((input) => input.addEventListener('change', updateUrlParams));

    document.getElementById('add-box').addEventListener('click', () => addBox());
    document
        .getElementById('refresh-all')
        .addEventListener('click', () => getBoxes().forEach(refreshInstance));

    updateRefreshRates();
    document.getElementById('refresh-rate').addEventListener('change', updateRefreshRates);
    refreshInstances();

    document.getElementById('view-mode').addEventListener('click', setVmixButtons);
    document.getElementById('show-mixer').addEventListener('click', setMixerVisibility);

    const executeBtn = document.getElementById('execute-btn');
    executeBtn.onclick = () => customExecution(document.getElementById('rawRequest').value);

    document.querySelectorAll('.function-btn').forEach((btn) => {
        btn.onclick = () => {
            const container = btn.parentElement.parentElement;
            const inputParam = container.querySelector('.input-param');
            const valueParam = container.querySelector('.value-param');
            const volumeParam = container.querySelector('.volume-param');
            const msParam = container.querySelector('.ms-param');

            let request = 'Function=' + btn.innerHTML;
            if (inputParam?.value) {
                request += '&Input=' + inputParam.value;
            }
            if (valueParam?.value) {
                request += '&Value=' + valueParam.value;
            }
            if (volumeParam?.value && msParam?.value) {
                request += '&Value=' + volumeParam.value + ',' + msParam.value;
            }
            customExecution(request);
        };
    });

    new Sortable(document.getElementById('boxes'), {
        animation: 150,
        handle: '.cursor-grab', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
        onEnd: function (e) {
            updateBoxNums();
            updateUrlParams();
        },
    });
})();
