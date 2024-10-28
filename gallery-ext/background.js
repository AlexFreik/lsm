const m = {
    audioLevels: 'AUDIO_LEVELS',
    noAudioBlink: 'NO_AUDIO_BLINK',
    muteClick: 'MUTE_CLICK',
    setQuality: 'SET_QUALITY',
    autoLive: 'AUTO_LIVE',
};

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (Object.values(m).includes(msg.type)) {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    }
});
