import { getPlayer } from './players.js';

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

// ===== Embed Top Buttons =====
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
    embedContainer.appendChild(getPlayer(getType(box), getVideoId(box)));
}

function removeVideo(btn) {
    const box = btn.parentNode.parentNode;
    box.parentNode.removeChild(box);
    updateUrlParameters();
}

export { getVideoName, getVideoId, getType, expandVideo, refreshVideo, removeVideo };
