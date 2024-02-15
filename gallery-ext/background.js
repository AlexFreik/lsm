chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes('youtube.com/watch')) {
        const queryParameters = tab.url.split('?')[1];
        const urlParameters = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId, {
            type: 'NEW',
            videoId: urlParameters.get('v'),
        });
    }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'SET_QUALITY') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    } else if (msg.type === 'AUTO_LIVE') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    }
});
