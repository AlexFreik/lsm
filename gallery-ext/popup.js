(() => {
    const manifestData = chrome.runtime.getManifest();
    const version = manifestData.version;
    document.getElementById('version').innerHTML = version;
})();
