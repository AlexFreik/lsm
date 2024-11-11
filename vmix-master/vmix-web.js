async function renderVmixWeb() {
    const vmixContainer = document.getElementById('vmixContainer');
    const masterInput = document.getElementById('master');
    const disabled = document.getElementById('view').checked;

    const master = getBox(getMaster());
    if (master === null) {
        vmixContainer.innerHTML = '';
        masterInput.classList.add('input-error');
        return;
    }
    masterInput.classList.remove('input-error');

    const vmixInfo = getBoxVmixInfo(master);
    if (vmixInfo === null || vmixInfo.error) {
        vmixContainer.innerHTML = '';
        return;
    }
    const info = vmixInfo.value;

    const active = info.inputs[info.active];
    const preview = info.inputs[info.preview];
    const screensHTML = `
      <div class="grid text-center grid-rows-5 grid-cols-[250px_120px_250px] gap-1 w-[620px] h-[200px] mx-auto mt-5 wrap">
          <div class="row-span-4 col-span-1 bg-yellow-600 text-lg font-semibold">
              ${preview.title}
          </div>
          <div class="row-span-1 col-span-1">
              <button class="btn btn-sm btn-neutral w-24" onclick="transition('Stinger1', ${preview.number})" ${disabled ? 'disabled' : ''}>Stinger 1</button>
          </div>
          <div class="row-span-4 col-span-1 bg-green-700 text-lg font-semibold">
              ${active.title}
          </div>
          <div class="row-span-1 col-span-1">
              <button class="btn btn-sm btn-neutral w-24" onclick="transition('Fade', ${preview.number})" ${disabled ? 'disabled' : ''}>Fade</button>
          </div>
          <div class="row-span-1 col-span-1">
              <button class="btn btn-sm btn-neutral w-24" onclick="transition('Cut', ${preview.number})" ${disabled ? 'disabled' : ''}>Cut</button>
          </div>
          <div class="row-span-1 col-span-1">
              <button class="${info.fadeToBlack ? 'btn-error' : 'btn-neutral'} btn btn-sm w-24" onclick="transition('FadeToBlack', '')" ${disabled ? 'disabled' : ''}>FTB</button>
          </div>
          <div class="row-span-1 col-span-1">
            ${getInputProgress(preview)}
          </div>
          <div class="row-span-1 col-span-1"></div>
          <div class="row-span-1 col-span-1">
            ${getInputProgress(active)}
          </div>
      </div>`;

    let inputsHTML = '<div>';
    let mixerHTML = '<div class="mt-5">';
    info.inputs.forEach((input, i) => {
        const isActive = i === info.active;
        const isPreview = i === info.preview;
        const style = isActive ? 'bg-green-700' : isPreview ? 'bg-yellow-600' : 'bg-neutral';
        inputsHTML += `
            <div class="inline-block mx-1 my-1 border border-neutral">
                <div class="${style} w-64 whitespace-nowrap overflow-hidden flex ${disabled ? '"' : `cursor-pointer" disabled onclick="previewInput(${i})"`}">
                    <span class="badge badge-neutral mx-1 my-1 w-[24px]">${input.number}</span>
                    ${getResponsiveTitle(input.title)}
                </div>
                <div class="m-1">
                <span class="badge rounded ${info.overlays[1] === i ? 'bg-green-700' : 'badge-neutral'} w-[22px] ${disabled ? '"' : `cursor-pointer" : onclick="overlayInput(${i}, 1)"`}>1</span>
                <span class="badge rounded ${info.overlays[2] === i ? 'bg-green-700' : 'badge-neutral'} w-[22px] ${disabled ? '"' : `cursor-pointer" onclick="overlayInput(${i}, 2)"`}>2</span>
                <span class="badge rounded ${info.overlays[3] === i ? 'bg-green-700' : 'badge-neutral'} w-[22px] ${disabled ? '"' : `cursor-pointer" onclick="overlayInput(${i}, 3)"`}>3</span>
                <span class="badge rounded ${info.overlays[4] === i ? 'bg-green-700' : 'badge-neutral'} w-[22px] ${disabled ? '"' : `cursor-pointer" onclick="overlayInput(${i}, 4)"`}>4</span>
                <span class="badge rounded ${input.muted === 'False' ? 'bg-green-700' : 'badge-neutral'} ${disabled ? '"' : `cursor-pointer" onclick="muteInput(${i}, ${input.muted === 'False'})"`}>AUDIO</span>
                <span class="badge rounded ${input.loop === 'True' ? 'bg-green-700' : 'badge-neutral'} ${disabled ? '"' : `cursor-pointer" onclick="loopInput(${i}, ${input.loop === 'True'})"`}>LOOP</span>
                </div>
            </div>`;
        if (input.volume !== undefined) {
            const meterF1 = Math.round(parseFloat(input.meterF1) * 100);
            const meterF2 = Math.round(parseFloat(input.meterF2) * 100);
            mixerHTML += `
              <div class="inline-block w-[95px] border border-neutral pb-1 m-1 bg-base-100">
                <div class="whitespace-nowrap overflow-hidden ${input.muted === 'False' ? 'bg-green-700' : 'bg-primary-content'} mb-1">
                  <span class="badge badge-neutral w-[24px] mx-1 my-1">${input.number}</span>${input.title}
                    </div>
                <div class="relative ">
                  <div class="inline-block h-24 w-1">
                      <div class="bg-black" style="height: ${100 - meterF1}%"></div>
                      <div class="bg-green-500" style="height: ${meterF1}%"></div>
                  </div>
                  <div class="inline-block h-24 w-1">
                      <div class="bg-black" style="height: ${100 - meterF2}%"></div>
                      <div class="bg-green-500" style="height: ${meterF2}%"></div>
                  </div>
                  <div class="inline-block -mt-5 text-center">
                    ${Math.round(input.volume)}%
                    <br />
                    <button class="btn btn-xs btn-outline" onclick="fadeAudio(${i}, 0)" ${disabled ? 'disabled' : ''}>0%</button>
                    <br />
                    <button class="btn btn-xs btn-outline" onclick="fadeAudio(${i}, 91)" ${disabled ? 'disabled' : ''}>70%</button>
                    <br />
                    <button class="btn btn-xs btn-outline" onclick="fadeAudio(${i}, 100)" ${disabled ? 'disabled' : ''}>100%</button>
                  </div>
                </div>
                <div class="px-1">
                    <span class="badge badge-sm rounded w-[22px] ${input.audiobusses.includes('M') ? 'bg-green-700' : 'badge-neutral'}">M</span>
                    <span class="badge badge-sm rounded w-[22px] ${input.audiobusses.includes('A') ? 'bg-green-700' : 'badge-neutral'}">A</span>
                    <span class="badge badge-sm rounded w-[22px] ${input.audiobusses.includes('B') ? 'bg-green-700' : 'badge-neutral'}">B</span>
                </div>
              </div>`;
        }
    });
    inputsHTML += '</div>';
    mixerHTML += '</div>';

    vmixContainer.innerHTML = screensHTML + inputsHTML + mixerHTML;
}

function getMaster() {
    const master = parseInt(document.getElementById('master').value);
    return isNaN(master) ? null : master;
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

function previewInput(inputNum) {
    masterSlaveExecute('Function=PreviewInput&Input=' + inputNum);
}

function transition(type, inputNum) {
    masterSlaveExecute('Function=' + type + '&Input=' + inputNum);
}

function fadeAudio(inputNum, vol) {
    masterSlaveExecute('Function=SetVolumeFade&Value=' + vol + ',3000&Input=' + inputNum);
}

function overlayInput(inputNum, overlayNum) {
    masterSlaveExecute('Function=OverlayInput' + overlayNum + '&Input=' + inputNum);
}

function muteInput(inputNum, on) {
    masterSlaveExecute(`Function=${on ? 'AudioOff' : 'AudioOn'}&Input=${inputNum}`);
}

function loopInput(inputNum, on) {
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
