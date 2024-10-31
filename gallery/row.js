import { updateUrlParams } from './tools.js';

function createRow(name, type, value) {
    const div = document.createElement('div');
    div.className = 'row flex items-center gap-1 rounded';

    div.innerHTML = `
        <span class="handle badge cursor-grab">
            <svg class="fill-current w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
        </span>
        <input type="text" placeholder="Name" value="${name}" class="row-name input input-xs input-bordered w-36 ml-0" />
        <select class="row-type select select-bordered select-xs w-36">
          <option value="YT" ${type === 'YT' ? 'selected' : ''}>YT (YouTube)</option>
          <option value="YN" ${type === 'YN' ? 'selected' : ''}>YN (YouTube with enhanced privacy)</option>
          <option value="JW" ${type === 'JW' ? 'selected' : ''}>JW (JW Player)</option>
          <option value="SS" ${type === 'SS' ? 'selected' : ''}>SS (Screen Share)</option>
          <option value="FB" ${type === 'FB' ? 'selected' : ''}>FB (Facebook)</option>
          <option value="CU" ${type === 'CU' ? 'selected' : ''}>CU (Custom)</option>
        </select>
        <input type="text" placeholder="ID" value="${value}" class="row-value input input-xs input-bordered flex-1" />
        <button class="close-btn btn btn-xs btn-error">
            <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
        </button>
    `;
    div.querySelector('.row-value').onpaste = (e) => {
        if (type === 'YT') {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');
            try {
                const url = new URL(paste);
                const vParam = url.searchParams.get('v');
                if (vParam) {
                    // https://www.youtube.com/watch?v=12345
                    event.target.value = vParam;
                } else if (url.pathname.startsWith('/live/')) {
                    // https://www.youtube.com/live/12345
                    event.target.value = url.pathname.slice(6);
                } else if (url.origin === 'https://youtu.be') {
                    // https://youtu.be/12345
                    event.target.value = url.pathname.slice(1);
                } else {
                    event.target.value = paste;
                }
            } catch (error) {
                event.target.value = paste;
            }
        }
    };
    div.querySelector('.close-btn').onclick = (e) => {
        const row = e.currentTarget.parentElement;
        const prev = row.previousElementSibling;
        const next = row.nextElementSibling;
        row.parentElement.removeChild(row);

        updateUrlParams();
    };
    return div;
}

export { createRow };
