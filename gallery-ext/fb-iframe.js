(async () => {
    console.log('Hi from Facebook Iframe');

    const adjustSettings = () => {
        // move video lo the left so there is a space for VU meter
        //videoElem.style['left'] = '0';
    };
    setInterval(adjustSettings, 5000);
})();

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_QUALITY') {
        // setQualityYT('min');
    } else if (msg.type === 'AUTO_LIVE') {
        autoLive = msg.value;
    }
});
