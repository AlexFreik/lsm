import { getBoxHost, execute } from './tools.js';
import { getBox } from './box.js';
import { getVmixInfo } from './vmix-info.js';

async function renderVmixWeb() {
    const vmixButtons = document.getElementById('vmixButtons');

    const master = getMaster();
    if (master === null) {
        vmixButtons.innerHTML = '';
        return;
    }
    const box = getBox(master);
    const vmixInfo = await getVmixInfo(getBoxHost(box) + ':8088');

    let innerHTML = '';
    if (vmixInfo.error) {
        innerHTML = vmixInfo.error;
    } else {
        const info = vmixInfo.value;

        const activeInput = info.inputs[info.active];
        const previewInput = info.inputs[info.preview];
        innerHTML += `
      <div class="grid text-center grid-rows-5 grid-cols-[1fr_120px_1fr] gap-1 w-[600px] h-[200px] mx-auto mt-5">
          <div class="row-span-4 col-span-1 bg-yellow-600 text-lg">
              ${previewInput.title}
          </div>
          <div class="row-span-1 col-span-1">
              <button id="stinger1" class="btn btn-sm btn-neutral w-24">Stinger 1</button>
          </div>
          <div class="row-span-4 col-span-1 bg-green-700 text-lg">
              ${activeInput.title}
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
            ${previewInput.duration !== '0' ? getVideoProgress(previewInput) : ''}
          </div>
          <div class="row-span-1 col-span-1"></div>
          <div class="row-span-1 col-span-1">
            ${activeInput.duration !== '0' ? getVideoProgress(activeInput) : ''}
          </div>
      </div>`;

        info.inputs.forEach((input, i) => {
            const isActive = i === info.active;
            const isPreview = i === info.preview;
            const style = isActive ? 'bg-green-700' : isPreview ? 'bg-yellow-600' : 'bg-neutral';
            console.lo;
            innerHTML += `
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
                </div>
            `;
        });
    }
    vmixButtons.innerHTML = innerHTML;

    document
        .querySelectorAll('.vmixInput')
        .forEach((elem) => (elem.onclick = () => previewInput(elem.getAttribute('data-number'))));

    document.getElementById('stinger1').onclick = () => transition('Stinger1');
    document.getElementById('fade').onclick = () => transition('Fade');
    document.getElementById('cut').onclick = () => transition('Cut');
}

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

function transition(type) {
    masterSlaveExecute('Function=' + type);
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
