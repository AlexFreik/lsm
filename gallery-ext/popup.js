export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true,
    });

    return tabs[0];
}

document.addEventListener('DOMContentLoaded', async () => {
    const activeTab = await getActiveTabURL();
    console.log(activeTab.url);
});
