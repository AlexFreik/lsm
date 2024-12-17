import {
    getBoxUrlParams,
    getConfigUrlParams,
    setInputValue,
    updateUrlParams,
    updateGalleryUrlInput,
} from './tools.js';
import { addBox } from './box.js';
import { addRow } from './row.js';

function initRows() {
    document.getElementById('data-rows').innerHTML = '';
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addRow();
    }
    urlParams.forEach((param) => {
        addRow(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function updateRows() {
    updateUrlParams();
    updateBoxes();
}

function updateBoxes() {
    document.getElementById('gallery').innerHTML = '';
    const urlParams = getBoxUrlParams();
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function setInputElements() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => setInputValue(param.key, param.value));
}

function showElements() {
    document.querySelectorAll('.show-toggle').forEach((elem) => {
        const name = elem.id.slice('show-'.length);
        const show = elem.checked;
        document.querySelectorAll('.' + name).forEach((e) => {
            if (show) {
                e.classList.remove('hidden');
            } else {
                e.classList.add('hidden');
            }
        });
    });
}

(() => {
    updateGalleryUrlInput();
    setInputElements();
    window.mics = [];
    initRows();
    updateBoxes();
    showElements();

    document.querySelectorAll('.url-param').forEach((input) => {
        input.addEventListener('change', updateUrlParams);
    });

    document
        .querySelectorAll('.show-toggle')
        .forEach((elem) => elem.addEventListener('click', showElements));

    document.getElementById('update-gallery-url').addEventListener('click', () => {
        const galleryUrl = document.getElementById('gallery-url');
        window.location.href = galleryUrl.value;
    });

    document.getElementById('add-data-row').addEventListener('click', () => addRow());
    document.getElementById('update-rows').addEventListener('click', () => updateRows());

    const dataRows = document.getElementById('data-rows');
    new Sortable(dataRows, {
        animation: 150,
        handle: '.handle', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
    });
})();
