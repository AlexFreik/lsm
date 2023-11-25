
function loadStyles() {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.href = 'https://raw.githubusercontent.com/alexfreik/zam/master/styles.css';
    document.head.appendChild(linkElement);
}

function unmute() {
    const btn = document.getElementsByClassName("join-audio-container__btn")[0];
    if (btn.ariaLabel.includes("unmute")) {
        btn.click();
    }
}

function addDragging() {
    let isDragging = false;
    let offsetX, offsetY;

    const zamWindow = document.getElementById('zam-window');
    const zamWindowTitle = document.getElementById('zam-window-title');

    zamWindowTitle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - zamWindow.getBoundingClientRect().left;
        offsetY = e.clientY - zamWindow.getBoundingClientRect().top;
        zamWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        zamWindow.style.left = x + 'px';
        zamWindow.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        zamWindow.style.cursor = 'grab';
    });
}

function logCurrentStatus() {


}

function appendWindow() {
    // Create the window container
    const zamWindow = document.createElement('div');
    zamWindow.id = 'zam-window';
    zamWindow.className = 'zam-draggable-window';
    document.body.appendChild(zamWindow);

    // Create the title bar
    const zamWindowTitle = document.createElement('div');
    zamWindowTitle.id = 'zam-window-title';
    zamWindowTitle.className = 'zam-window-title';
    zamWindowTitle.textContent = 'Zoom Auto Monitoring';
    zamWindow.appendChild(zamWindowTitle);
    
    // Create the logs
    const zamLogs = document.createElement('div');
    zamLogs.id = 'zam-logs';
    zamLogs.className = 'zam-logs';
    zamWindow.appendChild(zamLogs);

    addDragging();

    // Event listener for collapsing/expanding
    zamWindowTitle.addEventListener('dblclick', () => {
        zamWindow.classList.toggle('collapsed');
        console.log("a")
    });
}

loadStyles();
appendWindow();
