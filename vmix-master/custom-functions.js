function customExecution(request) {
    const include = parseNumbers(document.getElementById('include').value);
    getBoxes()
        .filter((box) => include.includes(getBoxNumber(box)))
        .forEach((box) => execute(getApiUrl(getBoxHost(box), request)));
}

function renderCustomFunctions() {
    const input = {
        name: 'input',
        type: 'number',
        placeholder: 'Input',
        value: '',
        width: 'w-14',
        min: '1',
        max: '100',
    };
    const gain = {
        name: 'gain',
        type: 'number',
        placeholder: '0-24',
        value: '',
        width: 'w-14',
        min: '0',
        max: '24',
    };
    const volume = {
        name: 'volume',
        type: 'number',
        placeholder: '0-100',
        value: '100',
        width: 'w-14',
        min: '0',
        max: '100',
    };
    const min = {
        name: 'min',
        type: 'number',
        placeholder: 'min',
        value: '',
        width: 'w-14',
        min: '0',
        max: '10000',
    };
    const sec = {
        name: 'sec',
        type: 'number',
        placeholder: 'sec',
        value: '',
        width: 'w-14',
        min: '0',
        max: '10000',
    };
    const ms = {
        name: 'ms',
        type: 'number',
        placeholder: 'ms',
        value: '3000',
        width: 'w-14',
        min: '0',
        max: '60000',
    };

    const buttons = [
        { func: 'StartExternal', inputs: [] },
        { func: 'StopExternal', inputs: [] },
        { func: 'FadeToBlack', inputs: [] },
        { func: 'Stinger1', inputs: [input] },
        { func: 'Fade', inputs: [input] },
        { func: 'Cut', inputs: [input] },
        { func: 'SetGain', inputs: [gain, input] },
        { func: 'SetVolumeFade', inputs: [volume, ms, input] },
        { func: 'SetMasterVolume', inputs: [volume] },
        { func: 'SetBusAVolume', inputs: [volume] },
        { func: 'SetBusBVolume', inputs: [volume] },
        { func: 'AudioOn', inputs: [input] },
        { func: 'AudioOff', inputs: [input] },
        { func: 'MasterAudioOn', inputs: [] },
        { func: 'MasterAudioOff', inputs: [] },
        { func: 'BusAAudioOn', inputs: [] },
        { func: 'BusAAudioOff', inputs: [] },
        { func: 'BusBAudioOn', inputs: [] },
        { func: 'BusBAudioOff', inputs: [] },
        { func: 'SetPosition', inputs: [min, sec, input] },
        { func: 'StartCountdown', inputs: [input] },
        { func: 'StopCountdown', inputs: [input] },
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
            const gainParam = container.querySelector('.gain-param');
            const volumeParam = container.querySelector('.volume-param');
            const minParam = container.querySelector('.min-param');
            const secParam = container.querySelector('.sec-param');
            const msParam = container.querySelector('.ms-param');

            let request = 'Function=' + btn.innerHTML;
            if (inputParam?.value) {
                request += '&Input=' + inputParam.value;
            }
            if (gainParam?.value) {
                request += '&Value=' + gainParam.value;
            }
            if (volumeParam?.value && msParam?.value) {
                request += '&Value=' + volumeParam.value + ',' + msParam.value;
            } else if (volumeParam?.value) {
                request += '&Value=' + volumeParam.value;
            }
            if (minParam?.value && secParam?.value) {
                request +=
                    '&Value=' + (parseInt(minParam.value) * 60 + parseInt(secParam.value)) + '000';
            }
            customExecution(request);
        };
    });
}
