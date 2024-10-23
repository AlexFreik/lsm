import { getBoxHost, execute } from './tools.js';
import { getBox } from './box.js';
import { getVmixInfo } from './vmix-info.js';

async function renderVmixWeb() {
    const vmixContainer = document.getElementById('vmixContainer');

    const master = getMaster();
    if (master === null) {
        vmixContainer.innerHTML = '';
        return;
    }
    const box = getBox(master);
    const vmixInfo = await getVmixInfo(getBoxHost(box) + ':8088');

    if (vmixInfo.error) {
        vmixContainer.innerHTML = '';
        return;
    }
    const info = vmixInfo.value;

    const active = info.inputs[info.active];
    const preview = info.inputs[info.preview];
    const screensHTML = `
      <div class="grid text-center grid-rows-5 grid-cols-[1fr_120px_1fr] gap-1 w-[600px] h-[200px] mx-auto mt-5">
          <div class="row-span-4 col-span-1 bg-yellow-600 text-lg">
              ${preview.title}
          </div>
          <div class="row-span-1 col-span-1">
              <button id="stinger1" class="btn btn-sm btn-neutral w-24">Stinger 1</button>
          </div>
          <div class="row-span-4 col-span-1 bg-green-700 text-lg">
              ${active.title}
          </div>
          <div class="row-span-1 col-span-1">
              <button id="fade" class="btn btn-sm btn-neutral w-24">Fade</button>
          </div>
          <div class="row-span-1 col-span-1">
              <button id="cut" class="btn btn-sm btn-neutral w-24">Cut</button>
          </div>
          <div class="row-span-1 col-span-1">
          </div>
          <div class="row-span-1 col-span-1">
            ${preview.duration !== '0' ? getVideoProgress(preview) : ''}
          </div>
          <div class="row-span-1 col-span-1"></div>
          <div class="row-span-1 col-span-1">
            ${active.duration !== '0' ? getVideoProgress(active) : ''}
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
                <div class="vmixInput ${style} w-64 cursor-pointer" data-number="${i}">
                    <span class="badge badge-neutral mx-1 my-1">${input.number}</span>
                    ${input.title.length > 20 ? input.title.slice(0, 20) + '...' : input.title}
                </div>
                <div class="m-1">
                <span class="badge ${info.overlays[1] === i ? 'bg-green-700' : 'badge-neutral'}">1</span>
                <span class="badge ${info.overlays[2] === i ? 'bg-green-700' : 'badge-neutral'}">2</span>
                <span class="badge ${info.overlays[3] === i ? 'bg-green-700' : 'badge-neutral'}">3</span>
                <span class="badge ${info.overlays[4] === i ? 'bg-green-700' : 'badge-neutral'}">4</span>
                <span class="badge ${input.muted === 'False' ? 'bg-green-700' : 'badge-neutral'}">AUDIO</span>
                </div>
            </div>`;
        if (input.volume !== undefined) {
            const meterF1 = Math.round(parseFloat(input.meterF1) * 100);
            const meterF2 = Math.round(parseFloat(input.meterF2) * 100);
            mixerHTML += `
              <div class="inline-block w-24 border border-neutral pb-1 m-1 bg-base-100">
                <div class="${input.muted === 'False' ? 'bg-green-700' : 'bg-primary-content'} mb-1">
                  <span class="badge badge-neutral mx-1 my-1">${input.number}</span>
                  ${input.title.slice(0, 5)}
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
                  <div class="inline-block -mt-5 text-center mx-2">
                    ${Math.round(input.volume)}%
                    <br />
                    <button class="fadeAudioOut btn btn-xs btn-outline" data-number="${i}">0%</button>
                    <br />
                    <button class="fadeAudioIn btn btn-xs btn-outline" data-number="${i}">100%</button>
                    <br />
                    <span>&nbsp;</span>
                  </div>
                </div>
                <div class="px-1">
                    <span class="badge badge-sm ${input.audiobusses.includes('M') ? 'bg-green-700' : 'badge-neutral'}">M</span>
                    <span class="badge badge-sm ${input.audiobusses.includes('A') ? 'bg-green-700' : 'badge-neutral'}">A</span>
                    <span class="badge badge-sm ${input.audiobusses.includes('B') ? 'bg-green-700' : 'badge-neutral'}">B</span>
                </div>
              </div>`;
        }
    });
    inputsHTML += '</div>';
    mixerHTML += '</div>';

    vmixContainer.innerHTML = screensHTML + inputsHTML + mixerHTML;

    document
        .querySelectorAll('.vmixInput')
        .forEach((elem) => (elem.onclick = () => previewInput(elem.getAttribute('data-number'))));
    document
        .querySelectorAll('.fadeAudioOut')
        .forEach((elem) => (elem.onclick = () => fadeAudioOut(elem.getAttribute('data-number'))));
    document
        .querySelectorAll('.fadeAudioIn')
        .forEach((elem) => (elem.onclick = () => fadeAudioIn(elem.getAttribute('data-number'))));

    document.getElementById('stinger1').onclick = () => transition('Stinger1', preview.number);
    document.getElementById('fade').onclick = () => transition('Fade', preview.number);
    document.getElementById('cut').onclick = () => transition('Cut', preview.number);
}

function getMixer() {}

function getMaster() {
    const master = parseInt(document.getElementById('master').value);
    return isNaN(master) ? null : master;
}

function getSlaves() {
    return document
        .getElementById('slaves')
        .value.split(' ')
        .map((num) => num.trim())
        .filter((num) => num !== '')
        .map((num) => parseInt(num));
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

function getVideoProgress(input) {
    console.assert(['Video', 'AudioFile'].includes(input.type));
    const duration = parseInt(input.duration);
    const position = parseInt(input.position);
    const remaining = duration - position;
    return `${formatTime(position)} / ${formatTime(duration)} / ${formatTime(remaining)}`;
}

function previewInput(inputNum) {
    masterSlaveExecute('Function=PreviewInput&Input=' + inputNum);
}

function transition(type, inputNum) {
    masterSlaveExecute('Function=' + type + '&Input=' + inputNum);
}

function fadeAudioIn(inputNum) {
    masterSlaveExecute('Function=SetVolumeFade&Value=100,3000&Input=' + inputNum);
}

function fadeAudioOut(inputNum) {
    masterSlaveExecute('Function=SetVolumeFade&Value=0,3000&Input=' + inputNum);
}

function masterSlaveExecute(command) {
    const master = getMaster();
    const slaves = getSlaves();
    slaves.unshift(master);
    slaves
        .map((num) => getBoxHost(getBox(num)))
        .forEach((host) => execute('http://' + host + ':8088/api/?' + command));
}

export { renderVmixWeb };
