# ZAM: Zoom Auto Monitoring

## How to Use

Open developer Console in Chrome browser and execute this line (press F12):
```js
document.getElementById('webclient').contentWindow.document.body.appendChild(Object.assign(document.createElement('script'), { src: 'https://alexfreik.github.io/zam/script.js' }));
```