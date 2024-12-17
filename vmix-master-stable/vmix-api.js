// ===== vMix API Utils =====
async function fetchUrl(url) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        const data = await response.text();
        return {
            status: response.status,
            value: data,
            error: null,
        };
    } catch (error) {
        return {
            status: null,
            value: null,
            error: error,
        };
    }
}

function getApiUrl(host, request = '') {
    const fullHost = host.includes(':') ? host : host + ':8088';
    return 'http://' + fullHost + '/api/?' + request;
}

async function execute(url, isShow = true) {
    const res = await fetchUrl(url);
    const timestamp = new Date().toLocaleTimeString();
    storeLog(url, res.status, res.value, res.error, timestamp);
    if (isShow) {
        showLog(url, res.status, res.value, res.error, timestamp);
    }
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

function fadeInputAudio(inputNum) {
    const volume = document.getElementById('volume-' + inputNum).value;
    masterSlaveExecute('Function=SetVolumeFade&Value=' + volume + ',3000&Input=' + inputNum);
}

function setInputGain(inputNum) {
    const value = document.getElementById('gain-' + inputNum).value;
    masterSlaveExecute('Function=SetGain&Value=' + value + '&Input=' + inputNum);
}

function toggleAudioBus(inputNum, bus) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const on = info.inputs[inputNum].audiobusses.includes(bus);
    masterSlaveExecute(`Function=AudioBus${on ? 'Off' : 'On'}&Value=${bus}&Input=${inputNum}`);
}

function toggleSendToMaster(bus) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const on = info.audio[getBusName(bus)].sendToMaster === 'True';
    masterSlaveExecute(`Function=BusXSendToMaster${on ? 'Off' : 'On'}&Value=${bus}`);
}

function toggleBusAudio(bus) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const fullName = { M: 'master', A: 'busA', B: 'busB' };
    const on = info.audio[fullName[bus]].muted === 'False';
    masterSlaveExecute(`Function=${getBusName(bus, true)}Audio${on ? 'Off' : 'On'}`);
}

function setBusVolume(bus) {
    const info = getMasterInfo();
    if (info === null) {
        return;
    }
    const value = document.getElementById('volume-' + bus).value;
    masterSlaveExecute(`Function=Set${getBusName(bus, true)}Volume&Value=${value}`);
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
    removeDuplicates(slaves)
        .map((num) => getBoxHost(getBox(num)))
        .forEach((host) => execute(getApiUrl(host, command)));
}
