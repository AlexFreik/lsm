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

function showElements() {
    document.querySelectorAll('.show-toggle').forEach((elem) => {
        const name = elem.id.slice('show-'.length);
        const show = elem.checked;
        document.querySelectorAll('.' + name).forEach((e) => {
            if (show) {
                e.classList.remove('hidden');
            } else {
                e.classList.add('hidden');
            }
        });
    });
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
    renderCustomFunctions();
    prerenderVmixWeb();
    showStoredLogs();
    showElements();

    document
        .querySelectorAll('.url-param')
        .forEach((input) => input.addEventListener('change', updateUrlParams));

    document
        .querySelectorAll('.show-toggle')
        .forEach((elem) => elem.addEventListener('click', showElements));

    document.getElementById('add-box').addEventListener('click', () => addBox());
    document
        .getElementById('refresh-all')
        .addEventListener('click', () => getBoxes().forEach(refreshInstance));

    updateRefreshRates();
    document.getElementById('refresh-rate').addEventListener('change', updateRefreshRates);
    refreshInstances();

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
