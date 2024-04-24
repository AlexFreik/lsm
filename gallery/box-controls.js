import { getPlayer } from './players.js';
import { updateUrlParams } from './tools.js';

// ===== Box Data =====
function getVideoName(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-name')[0].value;
}

function getVideoId(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-id')[0].value;
}

function getType(box) {
    console.assert(box.classList.contains('box'));
    return box.getElementsByClassName('video-type')[0].value;
}

function getBoxId(box) {
    console.assert(box.classList.contains('box'));
    const boxId = box.dataset.boxId;
    console.assert(boxId);
    return boxId;
}

// ===== Embed Top Buttons =====
function muteVideo() {
    // Do nothing, logic will be implemented inside Extension
}

function expandVideo(btn) {
    const embedContainer = btn.parentNode;
    embedContainer.classList.toggle('expanded');
    if (embedContainer.classList.contains('expanded')) {
        btn.innerHTML = 'Hide';
    } else {
        btn.innerHTML = 'Expand';
    }
}

function refreshVideo(btn) {
    const box = btn.parentNode.parentNode;
    const embedContainer = btn.parentNode;
    const player = embedContainer.lastChild;

    embedContainer.removeChild(player);
    embedContainer.appendChild(getPlayer(getType(box), getVideoId(box), getBoxId(box)));
}

function removeVideo(btn) {
    const box = btn.parentNode.parentNode;
    const prev = box.previousElementSibling;
    const next = box.nextElementSibling;

    if (prev) {
        box.parentNode.removeChild(prev);
    } else if (next?.classList.contains('swap-btn')) {
        box.parentNode.removeChild(next);
    }
    box.parentNode.removeChild(box);

    updateUrlParams();
}

function swapBoxes(e) {
    const swapBtn = e.target.parentNode;
    const prev = swapBtn.previousElementSibling;
    const next = swapBtn.nextElementSibling;
    console.assert(prev.classList.contains('box'));
    console.assert(next.classList.contains('box'));

    const parentElem = swapBtn.parentNode;
    parentElem.insertBefore(next, prev);
    parentElem.insertBefore(swapBtn, prev);

    updateUrlParams();
}

export {
    getVideoName,
    getVideoId,
    getType,
    muteVideo,
    expandVideo,
    refreshVideo,
    removeVideo,
    swapBoxes,
};
