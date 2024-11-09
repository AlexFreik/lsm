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

function refreshInstances() {
    const master = getMaster();

    getBoxes().forEach(async (box) => {
        if (getBoxNumber(box) === master) {
            return;
        }
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
    showStoredLogs();

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

    refreshInstances();
    setInterval(refreshInstances, 5000);
})();
