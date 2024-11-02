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

function executeRawRequest() {
    const request = document.getElementById('rawRequest').value;
    let include = parseNumbers(document.getElementById('include').value);
    if (include.length === 0) {
        include = Array.from({ length: getBoxCount() }, (_, i) => i + 1);
    }
    const exclude = parseNumbers(document.getElementById('exclude').value);
    const boxes = getBoxes().filter((box) => {
        const num = getBoxNumber(box);
        return include.includes(num) && !exclude.includes(num);
    });

    boxes.forEach((box) => execute(getApiUrl(getBoxHost(box), request)));
}

function refreshInstances() {
    getBoxes().forEach(async (box) => {
        const host = getBoxHost(box);
        if (host === '') {
            clearVmixInfo(box);
        } else {
            const info = await getVmixInfo(host);
            updateVmixInfo(box, info);
        }
    });
}

(() => {
    updateDocumentConfig();
    initBoxes();
    setInterval(renderVmixWeb, 1000);

    document
        .querySelectorAll('.url-param')
        .forEach((input) => input.addEventListener('change', updateUrlParams));

    document.getElementById('add-box').addEventListener('click', () => addBox());
    document.getElementById('refresh-all').addEventListener('click', refreshInstances);

    const executeBtn = document.getElementById('execute-btn');
    executeBtn.onclick = executeRawRequest;

    new Sortable(document.getElementById('boxes'), {
        animation: 150,
        handle: '.cursor-grab', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
        onEnd: function (e) {
            updateBoxNums();
            updateUrlParams();
        },
    });

    refreshInstances();
    setInterval(refreshInstances, 5000);
})();
