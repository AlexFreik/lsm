# Gallery Chrome Extension

Because of the CORS policy, we can't access the videos with JavaScript directly.
That is why a Chrome Extension is required to enable VU meters, automatic quality adjustment, always staying on LIVE and other features.

## Installation

1. Go to the root of this repo: [https://github.com/AlexFreik/lsm](https://github.com/AlexFreik/lsm)
2. Click on the green **"Code"** button, and download it using the **"Download ZIP"** option (or clone it).

    ![image](./assets/download-zip.avif)

3. Unpack the ZIP.
4. Go to the Chrome Extensions [chrome://extensions/](chrome://extensions/)
5. Switch on **"Developer mode"** in the top right corner.
6. Click the **"Load unpacked"** button and select the `gallery-ext/` folder.

    ![image](./assets/load-unpacked.avif)

## Update

To update the extension you can remove it and install it again.

If you know how to use **Git** you can `git pull` the changes and just click
the refresh button.

<img src="./assets/remove-or-reload.avif" width="400">
