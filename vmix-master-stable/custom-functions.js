function customExecution(request) {
    const include = parseNumbers(document.getElementById('include').value);
    getBoxes()
        .filter((box) => include.includes(getBoxNumber(box)))
        .forEach((box) => execute(getApiUrl(getBoxHost(box), request)));
}

function renderCustomFunctions() {
    const input = {
        name: 'input',
        type: 'text',
        placeholder: 'Input',
        value: '',
        width: 'w-14',
    };
    const volume = {
        name: 'volume',
        type: 'number',
        placeholder: '0-100',
        value: '100',
        width: 'w-16',
        min: '0',
        max: '100',
    };
    const ms = {
        name: 'ms',
        type: 'text',
        placeholder: 'ms',
        value: '3000',
        width: 'w-14',
    };

    const buttons = [
        { func: 'StartExternal', inputs: [] },
        { func: 'StopExternal', inputs: [] },
        { func: 'FadeToBlack', inputs: [] },
        { func: 'SetVolumeFade', inputs: [volume, ms, input] },
        { func: 'Fade', inputs: [input] },
        { func: 'Stinger1', inputs: [input] },
        { func: 'AudioOn', inputs: [input] },
        { func: 'AudioOff', inputs: [input] },
    ];

    let innerHTML = '';
    buttons.forEach((b) => {
        innerHTML += `
          <div class="m-1 w-fit rounded-box bg-neutral p-3">
            <div class="mx-auto w-fit">
            ${
                b.inputs.length === 0
                    ? '&nbsp;'
                    : b.inputs
                          .map(
                              (input) => `
              <input
                type="${input.type}"
                placeholder="${input.placeholder}"
                name: "${input.name}"
                class="${input.name}-param input input-xs input-bordered ${input.width}"
                value="${input.value}"
                min="${input.min}"
                max="${input.max}" />`,
                          )
                          .join('')
            }
            </div>
            <div class="mx-auto w-fit">
              <button class="function-btn btn btn-outline btn-secondary btn-sm mt-1">${b.func}</button>
            </div>
          </div>`;
    });

    document.querySelector('.custom-functions-container').innerHTML += innerHTML;

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
}
