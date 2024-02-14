function createAudioBtnMock(doc) {
    const audioBtn = doc.createElement('button');
    audioBtn.className = 'join-audio-container__btn muted';
    audioBtn.ariaLabel = 'unmute';
    audioBtn.textContent = 'Muted';
    doc.body.appendChild(audioBtn);

    audioBtn.addEventListener('click', function () {
        // Toggle between "muted" and "unmuted" classes on the button
        this.classList.toggle('muted');

        this.textContent = this.classList.contains('muted') ? 'Muted' : 'Unmuted';
        this.ariaLabel = this.classList.contains('muted') ? 'unmute' : 'mute';
    });
}
