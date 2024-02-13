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
    console.log(videoElem.style);
    const video = audioCtx.createMediaElementSource(videoElem);
    analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 32; //the total samples are half the fft size.
    const bufferLength = analyser.frequencyBinCount;
    video.connect(analyser);
    //analyser.connect(audioCtx.destination);
    window.ctx = document.getElementById('audio-meter').getContext('2d');

    const clickMonitorBtn = () => {
        const monitorBtn = document.getElementsByClassName('monitor-btn')[0];
        const iconImg = monitorBtn.firstChild;
        if (monitorBtn.classList.contains('off')) {
            analyser.connect(audioCtx.destination);
            monitorBtn.title = 'Mute monitor';
            iconImg.src = chrome.runtime.getURL('assets/headset.png');
        } else {
            analyser.disconnect();
            monitorBtn.title = 'Unmute monitor';
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

    function draw() {
        var array = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(array);
        ctx.clearRect(0, 0, 100, 100); // Clear the canvas

        var max = 0;
        for (i = 0; i < array.length; i++) {
            a = Math.abs(array[i] - 128);
            max = Math.max(max, a);
        }
        max = Math.round(max / 1.28);

        ctx.fillStyle = 'green';
        ctx.fillRect(0, 100 - max, 50, max);
        ctx.fillRect(50, 100 - max, 100, max);

        setTimeout(() => {
            requestAnimationFrame(draw);
        }, 500);
    }
    draw();

    const adjustSettings = () => {
        videoElem.style['left'] = '0';
    };

    setInterval(adjustSettings, 5000);
})();
