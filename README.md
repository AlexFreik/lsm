# ZAM: Zoom Auto Monitoring

## Table of Contents

-   [ZAM: Zoom Auto Monitoring](#zam-zoom-auto-monitoring)
    -   [Table of Contents](#table-of-contents)
    -   [Problem](#problem)
    -   [ZAM Solution](#zam-solution)
    -   [How to Use](#how-to-use)
    -   [Features](#features)
    -   [Development](#development)
    -   [Testing](#testing)

## Problem

We often host big Zoom sessions and stream to Zoom via OBS. Therefore
our mic must be always unmuted. We also added multiple co-hosts to help with monitoring chat and participants. But no
matter how much we train them, someone will always click the "Mute all" button. And this button will also mute the host...
As a result, a few minutes of the program get lost until we notice it and unmute ourselves.
The similar issue we have with the spotlight. We must be always spotlighted, but co-hosts sometimes remove this spotlight.

## ZAM Solution

We tried to fix this using `Zoom REST API`, but it doesn't give any way to unmute someone (even yourself). So we are creating
a `js` script (ZAM) that can be run in [Zoom Web Client](https://app.zoom.us/wc) and automatically monitor the meeting and fix it when co-hosts
break it.

Initially, we wanted to just join Zoom via web client. This way ZAM can check meeting every `5s` end unmute us if we are muted.
But it turned out that when we tried to play songs Zoom Web Client didn't handle them well. We are disabling Zoom noise suppression in audio
settings, but still audio is not clear, and clipping (unlike in Zoom Desktop Client).

So we want to join both Zoom Desktop and Web on the same laptop:

-   Zoom Desktop will be **"primary"** and we will be streaming video and audio as usual.
-   Zoom Web will be **"backup"**. ZAM will automatically detect if the **primary** is muted and will unmute backup in this case
    (we will use the same mic as a source). This way the audio may be less good for a minute, but still it is better than no audio :)
-   And when the primary is finally unmuted ZAM should mute backup automatically.

## How to Use

You will need to do the following:

1. Open Zoom Web Client [app.zoom.us/wc](https://app.zoom.us/wc):

  <img width="500" alt="Zoom Web Client" src="https://github.com/AlexFreik/zam/assets/61039123/f0c15a18-6ae3-4272-ac18-86de2e4bb901">

3. Open a meeting and join the audio.

4. Open the developer Console in Chrome browser and execute this line (press F12):

```js
document
    .getElementById('webclient')
    .contentWindow.document.body.appendChild(
        Object.assign(document.createElement('script'), {
            src: 'https://alexfreik.github.io/zam/script.js',
        }),
    );
```

5. If a new ZAM window appears it means you are done!

    <img width="500" alt="Screenshot 2023-11-29 at 12 54 35" src="https://github.com/AlexFreik/zam/assets/61039123/43a91dfb-d221-4a3b-bfc2-7fc810d93954">

## Features

The user should be able to set:

-   Monitoring intervals (`5s`` is the default).
-   Primary name in Zoom (`Isha Foundation` is default).
-   Auto unmute backup whenever it is muted (`disabled` by default).
-   Auto unmute backup when the primary is muted and mute backup when the primary is unmuted (`enabled`` by default).
-   Spotlight primary if it is not (`enabled` by default).

Also, it would be nice to add a "Set Focus Mode Configurations" button. During practices,
we need to set several meeting configs:

-   Focus Mode: participants can't see other participants
-   disallow participants to unmute themselves
-   participants can chat only with the host and co-host

## Development

We need to develop all the features above. Also, it would be nice if we could convert this into
a Chrome plugin so that it is more convenient to use.

## Testing

Install the dependencies:

```sh
make install
```

Start the server. You can access it at [http://localhost:3000](http://localhost:3000)

```sh
make start
```

Now you can go to any of the test `HTML` pages. ZAM window and Zoom Elements mocks will pop up. Just can check that everything works.
