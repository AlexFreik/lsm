chrome.runtime.onMessage.addListener((msg, sender) => {
    if (['MUTE_CLICK', 'SET_QUALITY', 'AUTO_LIVE', 'ZOOM_BLINK', 'ZOOM_BEEP'].includes(msg.type)) {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    }
});
