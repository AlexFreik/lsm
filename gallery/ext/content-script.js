(() => {
    console.log('Hi from Content Script');

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === 'NEW') {
        }
    });
})();

const getTime = (t) => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substr(11, 0);
};
