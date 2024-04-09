import { expandVideo, refreshVideo, removeVideo } from './box-controls.js';
import { getPlayer } from './players.js';
import { updateUrlParameters, capitalizeFirst } from './tools.js';

function createBox(name, type, videoId) {
    const box = document.createElement('div');
    box.className = 'box';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.onblur = () => updateUrlParameters();
    nameInput.placeholder = 'Name';
    nameInput.value = name;
    nameInput.className = 'video-name input input-bordered input-xs w-20 max-w-xs';
    box.appendChild(nameInput);

    const typeInput = document.createElement('select');
    typeInput.onblur = () => updateUrlParameters();
    typeInput.className = 'video-type select select-xs select-bordered w-16 max-w-xs ';
    const options = Array(6)
        .fill(null)
        .map((_) => document.createElement('option'));
    options.forEach((o) => typeInput.append(o));

    options[0].value = 'CU';
    options[0].text = 'CU (Custom)';
    options[0].selected = type === 'CU' || type === '';

    options[1].value = 'YT';
    options[1].text = 'YT (YouTube)';
    options[1].selected = type === 'YT';

    options[2].value = 'YN';
    options[2].text = 'YN (YouTube with enhanced privacy)';
    options[2].selected = type === 'YN';

    options[3].value = 'FB';
    options[3].text = 'FB (Facebook)';
    options[3].selected = type === 'FB';

    options[4].value = 'IG';
    options[4].text = 'IG (Instagram)';
    options[4].selected = type === 'IG';

    options[5].value = 'ZO';
    options[5].text = 'ZO (Zoom)';
    options[5].selected = type === 'ZO';

    box.appendChild(typeInput);

    const videoIdInput = document.createElement('input');
    videoIdInput.type = 'text';
    videoIdInput.onblur = () => updateUrlParameters();
    videoIdInput.placeholder = 'Video ID';
    videoIdInput.value = videoId;
    videoIdInput.className = 'video-id input input-bordered input-xs w-24 max-w-xs';
    box.appendChild(videoIdInput);

    const embedContainer = document.createElement('div');
    embedContainer.className = 'embed-container';
    box.appendChild(embedContainer);

    embedContainer.appendChild(createTopBtn('expand', expandVideo));
    embedContainer.appendChild(createTopBtn('refresh', refreshVideo));
    embedContainer.appendChild(createTopBtn('remove', removeVideo));

    embedContainer.appendChild(getPlayer(type, videoId));
    return box;
}

function createTopBtn(name, onclick) {
    const btn = document.createElement('button');
    btn.className = 'top-btn ' + name + '-btn';
    btn.onclick = () => onclick(btn);
    btn.appendChild(document.createTextNode(capitalizeFirst(name)));
    return btn;
}

export { createBox };
