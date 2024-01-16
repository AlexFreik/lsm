// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewBookmarks = () => {};

const onPlay = (e) => {};

const onDelete = (e) => {};

const setBookmarkAttributes = () => {};

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

    if (activeTab.url.includes('http://localhost:3000/gallery')) {
        console.log('hi from popup');
    } else {
        const container = document.getElementsByClassName('container')[0];
        container.innerHTML =
            '<div class="title">This is not a Gallery page.</div>';
    }
});
