const INPUTS_SIZE = 100;

function prerenderVmixWeb() {
    let inputsHTML = '';
    let mixersHTML = '';
    for (let i = 1; i <= INPUTS_SIZE; i++) {
        inputsHTML += `
          <div id="input-${i}" class="inline-block mx-1 my-1 border border-neutral hidden">
            <button class="preview-btn btn w-64 whitespace-nowrap overflow-hidden flex h-fit min-h-0 justify-start p-0 gap-0 rounded-none" onclick="previewInput(${i})">
              <span class="badge badge-neutral mx-1 my-1 w-[24px]">${i}</span>
              <span class="input-title whitespace-nowrap overflow-hidden inline-flex flex-1"></span>
            </button>
            <div class="m-1">
            <button class="overlay1-btn btn btn-neutral w-[22px] h-[20px] min-h-0 p-0 rounded" onclick="overlayInput(${i}, 1)">1</button>
            <button class="overlay2-btn btn btn-neutral w-[22px] h-[20px] min-h-0 p-0 rounded" onclick="overlayInput(${i}, 2)">2</button>
            <button class="overlay3-btn btn btn-neutral w-[22px] h-[20px] min-h-0 p-0 rounded" onclick="overlayInput(${i}, 3)">3</button>
            <button class="overlay4-btn btn btn-neutral w-[22px] h-[20px] min-h-0 p-0 rounded" onclick="overlayInput(${i}, 4)">4</button>
            <button class="audio-btn btn btn-neutral w-fit h-[20px] min-h-0 px-2 rounded" onclick="muteInput(${i})">AUDIO</button>
            <button class="loop-btn btn btn-neutral w-fit h-[20px] min-h-0 px-2 rounded" onclick="loopInput(${i})">LOOP</button>
            </div>
          </div>`;

        mixersHTML += `
          <div id="mixer-${i}" class="inline-block w-[95px] border border-neutral pb-1 m-1 bg-base-100 hidden">
            <div class="mixer-header whitespace-nowrap overflow-hidden p-0">
              <span class="badge badge-neutral w-[24px] ml-1 mr-0 my-1">${i}</span>
              <span class="mixer-title whitespace-nowrap overflow-hidden text-sm p-0"></span>
            </div>
            <div class="relative pl-[16px]">
              <div class="inline-block h-24 w-1 hidden">
                <div class="bg-black" style="height: 100%"></div>
                <div class="bg-success" style="height: 0%"></div>
              </div>
              <div class="inline-block h-24 w-1 hidden">
                <div class="bg-black" style="height: 100%"></div>
                <div class="bg-success" style="height: 0%"></div>
              </div>
              <canvas class="volume-canvas absolute left-0 top-0 w-[16px] h-full" width="100" height="100"></canvas>
              <div class="inline-block text-center">
                <div class="volume-value">100%</div>
                <input id="volume-${i}" type="number" min="1" max="100" placeholder="1-100" class="input input-xs input-bordered w-16 mt-1" value="100">
                <button class="btn btn-sm btn-neutral h-[24px] min-h-0 rounded mt-1" onclick="fadeAudio(${i})">Fade</button>
              </div>
            </div>
            <div class="px-1 mt-1">
              <button class="bus-M btn btn-sm w-[22px] h-[20px] min-h-0 rounded" onclick="toggleAudioBus(${i}, 'M')">M</button>
              <button class="bus-A btn btn-sm w-[22px] h-[20px] min-h-0 rounded" onclick="toggleAudioBus(${i}, 'A')">A</button>
              <button class="bus-B btn btn-sm w-[22px] h-[20px] min-h-0 rounded" onclick="toggleAudioBus(${i}, 'B')">B</button>
            </div>
          </div>`;
    }

    document.getElementById('vmix-inputs').innerHTML = inputsHTML;
    document.getElementById('vmix-mixers').innerHTML = mixersHTML;
}

async function renderVmixWeb() {
    const vmixContainer = document.getElementById('vmix-container');
    const masterInput = document.getElementById('master');
    const disabled = document.getElementById('view-mode').checked;

    const master = getMaster();
    if (master === null) {
        hideVmixWeb();
        masterInput.classList.add('input-error');
        return;
    }
    masterInput.classList.remove('input-error');

    const vmixInfo = getVmixInfo(master);
    if (vmixInfo === null || vmixInfo.error) {
        hideVmixWeb();
        return;
    }
    showVmixWeb();
    const info = vmixInfo.value;

    const active = info.inputs[info.active];
    const preview = info.inputs[info.preview];

    const screensElem = document.getElementById('vmix-screens');
    document.getElementById('active-title').innerHTML = active.title;
    document.getElementById('preview-title').innerHTML = preview.title;
    document.getElementById('active-progress').innerHTML = getInputProgress(active);
    document.getElementById('preview-progress').innerHTML = getInputProgress(preview);

    const ftbBtn = screensElem.querySelector('.ftb-btn');
    if (info.fadeToBlack) {
        ftbBtn.classList.remove('btn-neutral');
        ftbBtn.classList.add('btn-error');
    } else {
        ftbBtn.classList.add('btn-neutral');
        ftbBtn.classList.remove('btn-error');
    }

    const inputLength = info.inputs.length;
    for (let i = inputLength; i <= INPUTS_SIZE; i++) {
        document.getElementById('input-' + i).classList.add('hidden');
    }

    info.inputs.forEach((input, i) => {
        const inputElem = document.getElementById('input-' + i);
        inputElem.classList.remove('hidden');
        inputElem.querySelector('.input-title').innerHTML = getResponsiveTitle(input.title);
        const previewBtn = inputElem.querySelector('.preview-btn');
        setColor(previewBtn, i === info.active, i === info.preview);

        const overlay1Btn = inputElem.querySelector('.overlay1-btn');
        setColor(overlay1Btn, info.overlays[1] === i);
        const overlay2Btn = inputElem.querySelector('.overlay2-btn');
        setColor(overlay2Btn, info.overlays[2] === i);
        const overlay3Btn = inputElem.querySelector('.overlay3-btn');
        setColor(overlay3Btn, info.overlays[3] === i);
        const overlay4Btn = inputElem.querySelector('.overlay4-btn');
        setColor(overlay4Btn, info.overlays[4] === i);

        const audioBtn = inputElem.querySelector('.audio-btn');
        setColor(audioBtn, input.muted === 'False');
        if (input.volume === undefined) {
            audioBtn.classList.add('invisible');
        } else {
            audioBtn.classList.remove('invisible');
        }
        const loopBtn = inputElem.querySelector('.loop-btn');
        setColor(loopBtn, input.loop === 'True');

        const mixerElem = document.getElementById('mixer-' + i);
        if (input.volume === undefined) {
            mixerElem.classList.add('hidden');
            return;
        }
        mixerElem.classList.remove('hidden');

        mixerElem.querySelector('.mixer-title').innerHTML = input.title;
        const mixerHeader = mixerElem.querySelector('.mixer-header');
        setColor(mixerHeader, input.muted === 'False', false, 'bg');

        const canvas = mixerElem.querySelector('.volume-canvas');
        drawAudioLevels(canvas, input);

        const volumeValue = mixerElem.querySelector('.volume-value');
        volumeValue.innerHTML = Math.round(input.volume) + '%';

        const busM = mixerElem.querySelector('.bus-M');
        setColor(busM, input.audiobusses.includes('M'));
        const busA = mixerElem.querySelector('.bus-A');
        setColor(busA, input.audiobusses.includes('A'));
        const busB = mixerElem.querySelector('.bus-B');
        setColor(busB, input.audiobusses.includes('B'));
    });
}

function getMaster() {
    const master = parseInt(document.getElementById('master').value);
    return isNaN(master) ? null : master;
}

function getMasterInfo() {
    const master = getMaster();
    const info = getVmixInfo(master)?.value;
    if (info === undefined || info === null) {
        showError('Internal Error', "Couldn't fetch vMix status for box " + master);
        return null;
    }
    return info;
}

function hideVmixWeb() {
    const vmixContainer = document.getElementById('vmix-container');
    if (!vmixContainer.classList.contains('hidden')) {
        vmixContainer.classList.add('hidden');
    }
}

function showVmixWeb() {
    const vmixContainer = document.getElementById('vmix-container');
    if (vmixContainer.classList.contains('hidden')) {
        vmixContainer.classList.remove('hidden');
    }
}

function getSlaves() {
    const slaves = document.getElementById('slaves').value;
    return parseNumbers(slaves);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad hours, minutes, and seconds with leading zero if needed
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getInputProgress(input) {
    if (input.duration === '0') return '';
    console.assert(['Video', 'AudioFile', 'Photos'].includes(input.type));
    const duration = parseInt(input.duration);
    const position = parseInt(input.position);
    const remaining = duration - position;

    if (input.type === 'Photos') {
        return `${position} / ${duration} / ${remaining}`;
    }
    return `${formatTime(position)} / ${formatTime(duration)} / ${formatTime(remaining)}`;
}

function setColor(elem, active, preview = false, type = 'btn') {
    // bg-neutral bg-success bg-warning
    // btn-neutral btn-success btn-warning
    if (active) {
        elem.classList.remove(type + '-neutral');
        elem.classList.add(type + '-success');
        elem.classList.remove(type + '-warning');
    } else if (preview) {
        elem.classList.remove(type + '-neutral');
        elem.classList.remove(type + '-success');
        elem.classList.add(type + '-warning');
    } else {
        elem.classList.add(type + '-neutral');
        elem.classList.remove(type + '-success');
        elem.classList.remove(type + '-warning');
    }
}

function drawAudioLevels(canvas, input) {
    const ctx = canvas.getContext('2d');
    const left = parseFloat(input.meterF1);
    const right = parseFloat(input.meterF2);
    ctx.clearRect(0, 0, 100, 100);
    ctx.fillStyle = input.muted === 'True' ? '#0ca5e9' : '#2dd4bf';
    ctx.fillRect(0, 100 - left * 100, 48, 100);
    ctx.fillRect(52, 100 - right * 100, 100, 100);
}

// ===== vMix Web Commands =====
function previewInput(inputNum) {
    masterSlaveExecute('Function=PreviewInput&Input=' + inputNum);
}

function transition(type) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const inputNum = info.preview;
    const inputParam = type === 'FadeToBlack' ? '' : '&Input=' + inputNum;
    masterSlaveExecute('Function=' + type + inputParam);
}

function fadeAudio(inputNum) {
    const volume = document.getElementById('volume-' + inputNum).value;
    masterSlaveExecute('Function=SetVolumeFade&Value=' + volume + ',3000&Input=' + inputNum);
}

function toggleAudioBus(inputNum, bus) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const on = info.inputs[inputNum].audiobusses.includes(bus);
    const func = on ? 'AudioBusOff' : 'AudioBusOn';
    masterSlaveExecute(`Function=${func}&Value=${bus}&Input=${inputNum}`);
}

function overlayInput(inputNum, overlayNum) {
    masterSlaveExecute('Function=OverlayInput' + overlayNum + '&Input=' + inputNum);
}

function muteInput(inputNum) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const on = info.inputs[inputNum].muted === 'False';
    masterSlaveExecute(`Function=${on ? 'AudioOff' : 'AudioOn'}&Input=${inputNum}`);
}

function loopInput(inputNum) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const on = info.inputs[inputNum].loop === 'True';
    masterSlaveExecute(`Function=${on ? 'LoopOff' : 'LoopOn'}&Input=${inputNum}`);
}

function masterSlaveExecute(command) {
    const master = getMaster();
    const slaves = getSlaves();
    slaves.unshift(master);
    slaves
        .map((num) => getBoxHost(getBox(num)))
        .forEach((host) => execute(getApiUrl(host, command)));
}
