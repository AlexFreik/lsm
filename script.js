
function loadStyles() {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.href = 'https://raw.githubusercontent.com/alexfreik/zam/master/styles.css';
    document.head.appendChild(linkElement);
}

function unmute() {
    const btn = document.getElementsByClassName("join-audio-container__btn")[0];
    if (btn.ariaLabel.contains("unmute")) {
        btn.click();
    }
}

function appendWindow() {
    // Create the window container
    const monitoringWindow = document.createElement('div');
    monitoringWindow.className = 'draggable-window';
    document.body.appendChild(monitoringWindow);

    // Create the title bar
    const monitoringWindowTitle = document.createElement('div');
    monitoringWindowTitle.className = 'window-title';
    monitoringWindowTitle.textContent = 'Monitoring';
    monitoringWindow.appendChild(monitoringWindowTitle);

    // Initialize variables for dragging
    let isDragging = false;
    let offsetX, offsetY;

    // Event listeners for dragging
    monitoringWindowTitle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - monitoringWindow.getBoundingClientRect().left;
        offsetY = e.clientY - monitoringWindow.getBoundingClientRect().top;
        monitoringWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        monitoringWindow.style.left = x + 'px';
        monitoringWindow.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        monitoringWindow.style.cursor = 'grab';
    });

    // Event listener for collapsing/expanding
    monitoringWindowTitle.addEventListener('dblclick', () => {
        monitoringWindow.classList.toggle('collapsed');
    });
}

loadStyles();
appendWindow();
