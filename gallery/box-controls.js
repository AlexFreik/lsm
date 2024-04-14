import { getPlayer } from './players.js';
import { updateUrlParameters } from './tools.js';

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
    box.parentNode.removeChild(box);
    updateUrlParameters();
}

export { getVideoName, getVideoId, getType, muteVideo, expandVideo, refreshVideo, removeVideo };
