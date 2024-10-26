import { updateUrlParams } from './tools.js';

function refreshBox(btn) {}

function removeBox(btn) {
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

function getBox(num) {
    return document.getElementsByClassName('box')[num - 1];
}

function getBoxCount() {
    return document.getElementsByClassName('box').length + 1;
}

function updateBoxNums() {
    let cnt = 1;
    Array.from(document.getElementsByClassName('box')).forEach((box) => {
        box.getElementsByClassName('badge')[0].innerHTML = String(cnt++);
    });
}

function swapBoxes(e) {
    if (e.target.tagName === 'BUTTON') return;
    const swapBtn = e.target.parentNode;
    const prev = swapBtn.previousElementSibling;
    const next = swapBtn.nextElementSibling;
    console.assert(prev.classList.contains('box'));
    console.assert(next.classList.contains('box'));

    const parentElem = swapBtn.parentNode;
    parentElem.insertBefore(next, prev);
    parentElem.insertBefore(swapBtn, prev);

    updateBoxNums();
    updateUrlParams();
}

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

function createBox(name, host, num) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
        <span class="box-number badge">${num}</span>
        <input type="text" placeholder="Name" value="${name}" class="name-input input input-bordered input-xs w-20">
        <input type="text" placeholder="Host" value="${host}" class="host-input input input-bordered input-xs w-32">
        <div class="container relative max-w-full h-[150px] overflow-y-scroll rounded-lg border border-secondary bg-base-200 px-1">
          <button class="top-btn refresh-btn">Refresh</button>
          <button class="top-btn remove-btn">Remove</button>
          <div class="vmixInfo text-sm m-1 wrap"></div>
        </div>
        `;

    const nameInput = box.getElementsByClassName('name-input')[0];
    nameInput.onblur = updateUrlParams;

    const hostInput = box.getElementsByClassName('host-input')[0];
    hostInput.onblur = updateUrlParams;

    const removeBtn = box.getElementsByClassName('remove-btn')[0];
    removeBtn.onclick = () => removeBox(removeBtn);

    const refreshBtn = box.getElementsByClassName('refresh-btn')[0];
    refreshBtn.onclick = () => refreshBox(refreshBtn);

    return box;
}

export { createBox, createSwapBtn, getBox, getBoxCount };
