(async () => {
    console.log('Hi from YT Iframe');

    const canvas = document.createElement('canvas');
    canvas.id = 'audio-meter';
    canvas.width = 100;
    canvas.height = 100;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.right = '0';
    canvas.style.width = '20px';
    canvas.style.height = '100vh';
    document.body.appendChild(canvas);

    window.audioCtx = new AudioContext();
    const videoElem = document.getElementsByClassName('video-stream')[0];
    console.assert(videoElem != undefined);

    const video = audioCtx.createMediaElementSource(videoElem);

    const splitter = audioCtx.createChannelSplitter(2);
    video.connect(splitter);

    const buffSize = 16;

    const analyserL = audioCtx.createAnalyser();
    analyserL.smoothingTimeConstant = 0.2;
    analyserL.fftSize = buffSize * 2;
    splitter.connect(analyserL, 0);

    const analyserR = audioCtx.createAnalyser();
    analyserR.smoothingTimeConstant = 0.2;
    analyserR.fftSize = buffSize * 2;
    splitter.connect(analyserR, 1);

    const merger = audioCtx.createChannelMerger(2);
    merger.connect(audioCtx.destination);

    // Add monitor button so we can mute / unmute the audio
    // When I mute using regular YT button the VU meter stops receiving the audio
    const clickMonitorBtn = () => {
        const monitorBtn = document.getElementsByClassName('monitor-btn')[0];
        const iconImg = monitorBtn.firstChild;
        if (monitorBtn.classList.contains('off')) {
            analyserL.connect(merger, 0, 0);
            analyserR.connect(merger, 0, 1);
            iconImg.src = chrome.runtime.getURL('assets/headset.png');
        } else {
            analyserL.disconnect();
            analyserR.disconnect();
            iconImg.src = chrome.runtime.getURL('assets/headset-cross.png');
        }
        monitorBtn.classList.toggle('off');
    };

    (async () => {
        const iconImg = document.createElement('img');
        iconImg.alt = 'Headset Image';

        const monitorBtn = document.createElement('button');
        monitorBtn.className = 'ytp-button monitor-btn';

        volumeArea = document.getElementsByClassName('ytp-volume-area')[0];
        volumeArea.insertBefore(monitorBtn, volumeArea.firstChild);
        monitorBtn.appendChild(iconImg);

        monitorBtn.addEventListener('click', clickMonitorBtn);
        clickMonitorBtn();
    })();

    // Draw the VU meter
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    function draw() {
        const arrayL = new Float32Array(buffSize);
        const arrayR = new Float32Array(buffSize);
        analyserL.getFloatFrequencyData(arrayL);
        analyserR.getFloatFrequencyData(arrayR);
        ctx.clearRect(0, 0, 100, 100); // Clear the canvas

        let maxL = getMax(arrayL),
            maxR = getMax(arrayR);

        ctx.fillStyle = 'green';
        ctx.fillRect(0, 100 - maxL, 50, maxL);
        ctx.fillRect(50, 100 - maxR, 100, maxR);

        setTimeout(() => {
            requestAnimationFrame(draw);
        }, 200);
    }
    draw();

    // Adjust settings like quality, LIVE, etc.
    const adjustSettings = () => {
        videoElem.style['left'] = '0';
    };
    setInterval(adjustSettings, 5000);
})();
