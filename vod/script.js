function stylePlayer() {
    const iframe = document.getElementById('player').contentWindow.document;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://alexfreik.github.io/lsm/vod/player-styles.css';
    iframe.head.appendChild(link);
}
