class VmixInfo {
    constructor(jsonData) {
        this.preview = Number(jsonData.vmix.preview['#text']);
        this.active = Number(jsonData.vmix.active['#text']);
        this.recording = jsonData.vmix.recording['#text'] === 'True';
        this.external = jsonData.vmix.external['#text'] === 'True';
        this.streaming = jsonData.vmix.streaming['#text'] === 'True';
        this.fadeToBlack = jsonData.vmix.fadeToBlack['#text'] === 'True';

        this.inputs = [];
        jsonData.vmix.inputs.input.forEach(
            (i) => (this.inputs[Number(i['@attributes'].number)] = i['@attributes']),
        );

        this.overlays = [];
        jsonData.vmix.overlays.overlay
            .filter((o) => o['#text'] !== undefined)
            .forEach((o) => (this.overlays[Number(o['@attributes'].number)] = Number(o['#text'])));
    }
}

const parser = new DOMParser();
async function getVmixInfo(host) {
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

function renderVmixInfo(box) {
    const boxNum = getBoxNumber(box);
    const vmixInfo = vmixInfos[boxNum];

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
            <span class="badge ${info.recording ? 'badge-error' : ''} badge-outline rounded">REC</span>
            <span class="badge ${info.external ? 'badge-error' : ''} badge-outline rounded">EXT</span>
            <span class="badge ${info.stream ? 'badge-error' : ''} badge-outline rounded">STREAM</span>
            <span class="badge ${info.fadeToBlack ? 'badge-error' : ''} badge-outline rounded">FTB</span>
        </div>
        ${info.overlays
            .map((o, i) => `<span>Overlay ${i}: ${o}</span>`)
            .filter(Boolean)
            .join('; ')}
        <div class="flex gap-1 items-center">
          <span class="badge bg-green-700 w-[24px]">${active.number}</span>
          ${active.duration !== '0' ? `<div class="text-xs w-[80px] inline-block text-center">${getShortInputProgress(active)}</div>` : ''}
          <span class="whitespace-nowrap overflow-hidden inline-flex flex-1">${getResponsiveTitle(active.title)}</span>
        </div>
        <div class="flex gap-1 items-center">
          <span class="badge bg-yellow-600 w-[24px]">${preview.number}</span>
          ${preview.duration !== '0' ? `<div class="text-xs w-[77px] inline-block text-center">${getShortInputProgress(preview)}</div>` : ''}
          <span class="whitespace-nowrap overflow-hidden inline-flex flex-1">${getResponsiveTitle(preview.title)}</span>
        </div>

        <div class="mt-1 font-bold">Inputs</div>
        <ol>
            ${info.inputs
                .map(
                    (input, j) =>
                        `<li>
                            <span class="text-secondary">${j}.</span>&nbsp;${input.title}
                        </li>`,
                )
                .join('')}
        </ol>
    `;
}

function formatTimeMMSS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
}

function getShortInputProgress(input) {
    if (input.duration === '0') return '';

    console.assert(['Video', 'AudioFile', 'Photos'].includes(input.type));
    const duration = parseInt(input.duration);
    const position = parseInt(input.position);
    const remaining = duration - position;

    if (input.type === 'Photos') {
        return `${position} / ${duration} / ${remaining}`;
    }
    return `${formatTimeMMSS(duration)} | ${formatTimeMMSS(remaining)}`;
}
