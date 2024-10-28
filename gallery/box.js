import { muteVideo, expandVideo, refreshVideo, removeVideo, swapBoxes } from './box-controls.js';
import { getPlayer } from './players.js';
import { updateUrlParams, capitalizeFirst, generateUUID } from './tools.js';

function createSwapBtn() {
    const swapBtn = document.createElement('button');
    swapBtn.className = 'swap-btn cursor-default';
    swapBtn.onclick = (e) => swapBoxes(e);

    const img = document.createElement('img');
    img.className = 'h-4 w-4 cursor-pointer';
    img.src = './swap.svg';
    img.alt = 'Swap Icon';
    swapBtn.appendChild(img);

    return swapBtn;
}

function createBox(name, type, videoId) {
    const box = document.createElement('div');
    box.className = 'box';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.onblur = () => updateUrlParams();
    nameInput.placeholder = 'Name';
    nameInput.value = name;
    nameInput.className = 'video-name input input-bordered input-xs w-20 max-w-xs';
    box.appendChild(nameInput);

    const typeInput = document.createElement('select');
    typeInput.onblur = () => updateUrlParams();
    typeInput.className = 'video-type select select-xs select-bordered w-16 max-w-xs ';
    const options = Array(7)
        .fill(null)
        .map((_) => document.createElement('option'));
    options.forEach((o) => typeInput.append(o));

    options[0].value = 'YT';
    options[0].text = 'YT (YouTube)';
    options[0].selected = type === 'YT';

    options[1].value = 'YN';
    options[1].text = 'YN (YouTube with enhanced privacy)';
    options[1].selected = type === 'YN';

    options[2].value = 'JW';
    options[2].text = 'JW (JW Player)';
    options[2].selected = type === 'JW';

    options[3].value = 'SS';
    options[3].text = 'SS (Screen Share)';
    options[3].selected = type === 'SS';

    options[4].value = 'FB';
    options[4].text = 'FB (Facebook)';
    options[4].selected = type === 'FB';

    options[5].value = 'IG';
    options[5].text = 'IG (Instagram)';
    options[5].selected = type === 'IG';

    options[6].value = 'CU';
    options[6].text = 'CU (Custom)';
    options[6].selected = type === 'CU' || type === '';

    box.appendChild(typeInput);

    const videoIdInput = document.createElement('input');
    videoIdInput.type = 'text';
    videoIdInput.onblur = () => updateUrlParams();
    videoIdInput.placeholder = 'Video ID';
    videoIdInput.value = videoId;
    videoIdInput.className = 'video-id input input-bordered input-xs w-24 max-w-xs';
    box.appendChild(videoIdInput);

    const embedContainer = document.createElement('div');
    embedContainer.className = 'embed-container';
    box.appendChild(embedContainer);

    embedContainer.appendChild(createTopBtn('mute', muteVideo));
    embedContainer.appendChild(createTopBtn('expand', expandVideo));
    embedContainer.appendChild(createTopBtn('refresh', refreshVideo));
    embedContainer.appendChild(createTopBtn('remove', removeVideo));

    box.getElementsByClassName('mute-btn')[0].innerHTML = 'Unmute';

    const boxId = generateUUID();
    box.dataset.boxId = boxId;

    embedContainer.appendChild(getPlayer(type, videoId, boxId));
    return box;
}

function createTopBtn(name, onclick) {
    const btn = document.createElement('button');
    btn.className = 'top-btn ' + name + '-btn';
    btn.onclick = () => onclick(btn);
    btn.appendChild(document.createTextNode(capitalizeFirst(name)));
    return btn;
}

export { createBox, createSwapBtn };
