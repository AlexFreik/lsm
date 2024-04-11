chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'SET_QUALITY') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    } else if (msg.type === 'AUTO_LIVE') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    } else if (msg.type === 'ZOOM_BLINK') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    } else if (msg.type === 'ZOOM_BEEP') {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    }
});
