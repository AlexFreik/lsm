class VmixInfo {
    constructor(jsonData) {
        this.preset = jsonData.vmix.preset['#text'].split('\\').pop().slice(0, -5);
        this.preview = Number(jsonData.vmix.preview['#text']);
        this.active = Number(jsonData.vmix.active['#text']);
        this.recording = jsonData.vmix.recording['#text'] === 'True';
        this.external = jsonData.vmix.external['#text'] === 'True';
        this.streaming = jsonData.vmix.streaming['#text'] === 'True';
        this.fadeToBlack = jsonData.vmix.fadeToBlack['#text'] === 'True';

        const keyMap = {};
        jsonData.vmix.inputs.input.forEach(
            (i) => (keyMap[i['@attributes'].key] = Number(i['@attributes'].number)),
        );

        this.inputs = [];
        jsonData.vmix.inputs.input.forEach((i) => {
            const number = Number(i['@attributes'].number);
            this.inputs[number] = i['@attributes'];
            this.inputs[number].overlays = [];
            ensureArray(i.overlay).forEach((overlay) => {
                const overlayNumber = keyMap[overlay['@attributes'].key];
                this.inputs[number].overlays.push({
                    index: overlay['@attributes'].index,
                    number: overlayNumber,
                });
            });
        });
        this.overlays = [];
        jsonData.vmix.overlays.overlay
            .filter((o) => o['#text'] !== undefined)
            .forEach((o) => (this.overlays[Number(o['@attributes'].number)] = Number(o['#text'])));

        this.audio = {};
        Object.entries(jsonData.vmix.audio).forEach(([k, v]) => (this.audio[k] = v['@attributes']));
    }
}

const parser = new DOMParser();
async function fetchVmixInfo(host) {
    const res = await fetchUrl(getApiUrl(host));

    if (res.status === 200) {
        const xmlData = parser.parseFromString(res.value, 'text/xml');
        const jsonData = xml2json(xmlData);
        return {
            value: new VmixInfo(jsonData),
            error: null,
        };
    } else {
        return {
            value: null,
            error: res.error,
        };
    }
}

function getVmixInfo(number) {
    console.assert(number === null || Number.isInteger(number));
    if (number === null || getBox(number) === null) {
        return null;
    }
    return vmixInfos[number];
}

function setVmixInfo(number, info) {
    console.assert(Number.isInteger(number));
    vmixInfos[number] = info;
}

function renderVmixInfo(box) {
    const boxNum = getBoxNumber(box);
    const vmixInfo = getVmixInfo(boxNum);

    if (vmixInfo === null) {
        box.querySelector('.vmixInfo').innerHTML = '';
        return;
    }
    const infoDiv = box.getElementsByClassName('vmix-info');
    const info = vmixInfo.value;
    if (info === null) {
        box.querySelector('.vmixInfo').innerHTML = `vMix unavailable (${vmixInfo.error})`;
        return;
    }
    const active = info.inputs[info.active];
    const preview = info.inputs[info.preview];
    box.querySelector('.vmixInfo').innerHTML = `
      <div class="mb-1">
        <span class="badge font-semibold px-1 rounded">${info.preset}</span>
        ${info.recording ? '<span class="badge badge-error badge-outline px-1 rounded">REC</span>' : ''}
        ${info.external ? '<span class="badge badge-error badge-outline px-1 rounded">EXT</span>' : ''}
        ${info.stream ? '<span class="badge badge-error badge-outline px-1 rounded">STREAM</span>' : ''}
         ${info.fadeToBlack ? '<span class="badge badge-error badge-outline px-1 rounded">FTB</span>' : ''}
        ${info.overlays
            .map(
                (o, i) =>
                    `<span class="badge badge-success badge-outline px-1 rounded"> ${'<'.repeat(i)}${o}${'>'.repeat(i)}</span>`,
            )
            .filter(Boolean)
            .join('\n')}
      </div>
      <div class="flex gap-1 items-center">
        <span class="badge badge-success w-[24px] h-[16px]">${active.number}</span>
        ${active.duration !== '0' ? `<div class="text-xs min-w-[77px] inline-block text-center">${getShortInputProgress(active)}</div>` : ''}
        <span class="whitespace-nowrap overflow-hidden inline-flex flex-1">${getResponsiveTitle(active.title)}</span>
      </div>
      <div class="flex gap-1 items-center">
        <span class="badge badge-warning w-[24px] h-[16px] py-0">${preview.number}</span>
        ${preview.duration !== '0' ? `<div class="text-xs min-w-[77px] inline-block text-center">${getShortInputProgress(preview)}</div>` : ''}
        <span class="whitespace-nowrap overflow-hidden inline-flex flex-1">${getResponsiveTitle(preview.title)}</span>
      </div>
      <div class="divider my-0">Audio</div>
      ${['M', 'A', 'B']
          .map((bus) => {
              const busInfo = info.audio[getBusName(bus)];
              if (busInfo === undefined || busInfo.muted === 'True') {
                  return '';
              }
              return `
            <div class="gap-1 inline-block w-fit">
                <span class="${bus === 'M' || busInfo.sendToMaster === 'True' ? 'text-error' : 'text-secondary'}">${bus}:</span>
                <span>${getVolumeInfo(busInfo)}</span>
              </div>`;
          })
          .filter((str) => str !== '')
          .join('<span class="mx-1">|</span>')}
      ${info.inputs
          .filter((input) => input.muted === 'False')
          .map(
              (input) => `
              <div class="flex items-center gap-1">
                <span class="text-secondary">${input.number}.</span>
                <span>${getVolumeInfo(input)}</span>
                <span class="badge badge-success h-[16px] px-1 py-0">${input.audiobusses}</span>
                <span class="whitespace-nowrap overflow-hidden inline-flex flex-1">${getResponsiveTitle(input.title)}</span>
              </div>
              `,
          )
          .join('')}

      <div class="divider my-0">Inputs</div>
      <ol>
        ${info.inputs
            .map((input, i) => {
                const layers = input.overlays
                    .map((over) => `<span>&lt;${over.number}></span>`)
                    .join('');
                const duration = getInputDuration(input);
                return (
                    `<li>` +
                    `<span class="text-secondary">${i}.</span>&nbsp;` +
                    `${layers}${layers ? '&nbsp;|&nbsp;' : ''}` +
                    `<span class="italic">${duration}</span>${duration ? '&nbsp;|&nbsp;' : ''}` +
                    `${input.title}` +
                    `</li>`
                );
            })
            .join('')}
      </ol>`;
}

function getBusName(bus, capital = false) {
    const name = { M: 'master', A: 'busA', B: 'busB' }[bus];
    console.assert(name !== undefined, bus);
    return capital ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

function formatTimeMMSS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${hours === 0 ? '' : hours + ':'}${pad(minutes)}:${pad(seconds)}`;
}

function getShortInputProgress(input) {
    if (input.duration === '0') return '';

    console.assert(['Video', 'AudioFile', 'Photos'].includes(input.type), input.type);
    const duration = parseInt(input.duration);
    const position = parseInt(input.position);
    const remaining = duration - position;

    if (input.type === 'Photos') {
        return `${position} / ${duration} / ${remaining}`;
    }
    return `${formatTimeMMSS(duration)} | ${formatTimeMMSS(remaining)}`;
}

function getInputDuration(input) {
    if (input.duration === '0') return '';

    console.assert(['Video', 'AudioFile', 'Photos'].includes(input.type), input.type);
    const duration = parseInt(input.duration);
    if (input.type === 'Photos') {
        return duration;
    }

    return formatTimeMMSS(duration);
}

function getVolumeInfo(input) {
    let gain = '';
    if (input.gainDb !== undefined && input.gainDb !== '0') {
        gain = ' | ' + input.gainDb + 'dB';
    }
    return Math.round(input.volume) + '%' + gain;
}
