console.log('Hi from YT Iframe');

const canvas = document.createElement('canvas');
canvas.id = 'audio-meter';
canvas.width = 100;
canvas.height = 100;
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.right = '0';
canvas.style.width = '30px';
canvas.style.height = '100vh';

document.body.appendChild(canvas);

window.context = new AudioContext();
const videoElem = document.getElementsByClassName('video-stream')[0];
const video = context.createMediaElementSource(videoElem);
analyser = context.createAnalyser(); //we create an analyser
analyser.smoothingTimeConstant = 0.9;
const bufferLength = 512;
analyser.fftSize = bufferLength; //the total samples are half the fft size.
video.connect(analyser);
analyser.connect(context.destination);
window.ctx = document.getElementById('audio-meter').getContext('2d');

let globMax = 0;
function draw() {
    var array = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(array);
    ctx.clearRect(0, 0, 100, 100); // Clear the canvas

    var max = 0;
    for (i = 0; i < array.length; i++) {
        a = Math.abs(array[i] - 128);
        max = Math.max(max, a);
    }

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 100 - max, 50, max);
    ctx.fillRect(50, 100 - max, 100, max);

    requestAnimationFrame(draw);
}
draw();

// const meter = new Tone.Meter();
// const stream = video.captureStream();
// const audioTrack = new MediaStream(stream.getAudioTracks());
// const speaker = Tone.context.createMediaElementSource(audioTrack);

// speaker.connect(meter);
// // the current level of the mic
// setInterval(() => console.log(meter.getValue()), 1000);
// setInterval(() => console.log(meter.getLevel()), 1000);
