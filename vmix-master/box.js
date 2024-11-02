function updateBoxNums() {
    let cnt = 1;
    Array.from(document.getElementsByClassName('box')).forEach((box) => {
        box.querySelector('.badge').innerHTML = String(cnt++);
    });
}

function closeBox(e) {
    const box = e.currentTarget.parentElement.parentElement;
    box.parentNode.removeChild(box);
    updateBoxNums();
    updateUrlParams();
}

function createBox(name, host, num) {
    const box = document.createElement('div');
    box.className = 'box m-1 h-[180px] w-[279px]';
    box.innerHTML = `
        <div class="flex gap-1 items-center my-1">
            <span class="box-number badge badge-neutral cursor-grab w-7">${num}</span>
            <input type="text" placeholder="Name" value="${name}" class="name-input input input-bordered input-xs w-20">
            <input type="text" placeholder="Host" value="${host}" class="host-input input input-xs input-bordered flex-1 min-w-5">
            <button class="close-btn btn btn-xs btn-error btn-outline w-[24px] p-0">
                <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
        </div>
        <div class="container relative max-w-full h-[150px] overflow-y-scroll rounded-lg border border-secondary bg-base-200 px-1">
          <div class="vmixInfo text-sm m-1 wrap"></div>
        </div>
        `;

    box.querySelector('.name-input').onblur = updateUrlParams;
    box.querySelector('.host-input').onblur = updateUrlParams;
    box.querySelector('.close-btn').onclick = closeBox;

    return box;
}
