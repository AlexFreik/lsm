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

function setVmixButtons(e) {
    const disabled = e.currentTarget.checked;
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

    document.getElementById('view').addEventListener('click', setVmixButtons);

    const executeBtn = document.getElementById('execute-btn');
    executeBtn.onclick = () => customExecution(document.getElementById('rawRequest').value);

    document.querySelectorAll('.function-btn').forEach((btn) => {
        btn.onclick = () => {
            const container = btn.parentElement;
            const inputParam = container.querySelector('.input-param');
            const valueParam = container.querySelector('.value-param');

            let request = 'Function=' + btn.innerHTML;
            if (inputParam?.value) {
                request += '&Input=' + inputParam.value;
            }
            if (valueParam?.value) {
                request += '&Value=' + valueParam.value;
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

    refreshInstances();
    setInterval(refreshInstances, 5000);
})();
