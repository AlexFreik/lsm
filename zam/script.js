const MONITORING_INTERVAL = 5000;
const monitoringIntervalId = -1;
const GITHUB_URL = 'https://alexfreik.github.io/zam';

// ========== Styles ==========
/**
 * Dynamically loads a stylesheet into the document's head.
 */
function loadStyles() {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    const hostname = window.location.hostname;
    linkElement.href =
        hostname === '' ? './styles.css' : GITHUB_URL + '/styles.css';
    document.head.appendChild(linkElement);
}
// ====================

// ========== ZAM Window UI ==========
/**
 * Adds dragging functionality to ZAM Window.
 */
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

function clickAutoUnmuteBtn() {
    const btn = document.getElementById('zam-auto-unmute-btn');
    btn.classList.toggle('off');

    if (btn.classList.contains('off')) {
        btn.textContent = 'OFF';
    } else {
        btn.textContent = 'ON';
    }
}

/**
 * Dynamically creates and append ZAM Window to the document body.
 */
function appendWindow() {
    // Create the window container
    const zamWindow = document.createElement('div');
    zamWindow.id = 'zam-window';
    zamWindow.className = 'zam-draggable-window';
    document.body.insertBefore(zamWindow, document.body.firstChild);

    // Create the title bar
    const zamWindowTitle = document.createElement('div');
    zamWindowTitle.id = 'zam-window-title';
    zamWindowTitle.className = 'zam-window-title';
    zamWindowTitle.textContent = 'Zoom Auto Monitoring';
    zamWindow.appendChild(zamWindowTitle);

    // Create the logs
    const logs = document.createElement('div');
    logs.id = 'zam-logs';
    logs.className = 'zam-logs';
    zamWindow.appendChild(logs);

    // Auto unmute enable / disable
    const autoMuteContainer = document.createElement('div');
    autoMuteContainer.id = 'zam-auto-unmute-container';
    autoMuteContainer.textContent = 'Auto unmute: ';
    zamWindow.appendChild(autoMuteContainer);

    const autoUnmuteBtn = document.createElement('button');
    autoUnmuteBtn.id = 'zam-auto-unmute-btn';
    autoUnmuteBtn.textContent = 'ON';
    autoUnmuteBtn.addEventListener('click', clickAutoUnmuteBtn);
    autoMuteContainer.appendChild(autoUnmuteBtn);

    // close btn
    const closeBtn = document.createElement('div');
    closeBtn.id = 'zam-close-btn';
    zamWindow.appendChild(closeBtn);

    closeBtn.addEventListener('click', function () {
        stopChecking();
        zamWindow.parentNode.removeChild(zamWindow);
    });

    addDragging();

    // Event listener for collapsing/expanding
    zamWindowTitle.addEventListener('dblclick', () => {
        zamWindow.classList.toggle('collapsed');
        console.log('a');
    });
}
// ====================

function checkAndFix() {
    logAudioStatus();
    unmute();
}

function getAudioButton() {
    return document.getElementsByClassName('join-audio-container__btn')[0];
}

function isAutoUnmute() {
    return document.getElementById('zam-auto-unmute-btn').textContent === 'ON';
}

function isMuted() {
    return getAudioButton().ariaLabel.includes('unmute');
}

function unmute() {
    if (isMuted() && isAutoUnmute()) {
        getAudioButton().click();
        logMessage('Clicked unmute btn');
    }
}

function logAudioStatus() {
    const audioStatus = 'I am ' + (isMuted() ? 'muted' : 'unmuted');
    let type = '';
    if (isMuted()) type = 'attention';
    logMessage(audioStatus, type);
}

/**
 * Logs a message with a specified type to the designated logs container.
 *
 * @param {string} message - The message to be logged.
 * @param {string} type - The type of the log message (e.g., 'info', 'warning', 'error').
 * @returns {void}
 *
 * @example
 * // Example usage:
 * logMessage('This is an informational message.', 'error');
 */
function logMessage(message, type) {
    const currentDate = new Date();
    const currentTimeString = currentDate.toLocaleTimeString();

    const logs = document.getElementById('zam-logs');
    const logMsg = document.createElement('div');
    logMsg.className = 'zam-log-message ' + type;
    logMsg.textContent = currentTimeString + ': ' + message;

    logs.insertBefore(logMsg, logs.firstChild);
}

function stopChecking() {
    if (intervalId === -1) return;
    clearInterval(intervalId);
    intervalId = -1;
    console.log('Checking stopped.');
}

// ===== execute ZAM script =====
loadStyles();
appendWindow();
intervalId = setInterval(checkAndFix, MONITORING_INTERVAL);
