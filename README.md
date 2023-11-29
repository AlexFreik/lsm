# ZAM: Zoom Auto Monitoring

## Problem

We often host big Zoom sessions and stream to zoom via OBS. Therefore
our mic must be always unmuted. We also add multiple co-hosts to help with monitoring chat and participants. But no 
matter how much we train them, someone will always click the "Mute all" button. And this button will also mute host... 
As a result a few minutes of program get lost, until we notice it and unmute ourselves.

The simmilar issue we have with spotlight. We must be always spotlighted, but co-host sometimes remove this spotlight.


## Solution

We tried to fix this using `Zoom REST API`, but it doesn't give any way to unmute someone (even yourself). So we are creating
a `js` script (ZAM) that can be run in [Zoom Web Client](https://app.zoom.us/wc) and automatically monitor meeting and fix it when co-hosts
break it. 

Initially we wanted to just join Zoom with via web client. This way ZAM can check meeting every `5s` end unmute us if we are muted. But
it turned out when we try to play songs Zoom Web Client doesn't handle them well. We are disabling Zoom noise suppression in audio
settings, but still audio is not clear, and clipping (unlike in Zoom Desktop Client).

So we want to to join both Zoom Desctop and Web on the same laptop: 
- Zoom Desktop will be **"primary"** and we will be streaming video and autio as usual.
- Zoom Web will be **"backup"**. ZAM will automatically detect if **primary** is muted and will unmute backup in this case
   (we will use the same mic as a source). This way the audio may be less good for a minute, but still it is better then no audio :)
- And when primary is finally unmuted ZAM should mute backup automatically.

## Features

User should be able to set:
- Monitoring intervalas (`5s` is default).
- Primary name in Zoom (`Isha Foundation` is default).
- Auto unmute backup whenever it is muted (`disabled` by default).
- Auto unmute backup when primary is muted and mute backup when primary unmuted (`enabled` by default).
- Spotlight primary if it is not (`enabled` by default).

And also we are planning to have `presets` in ZAM. Now ech time when we create a meeting we need to 
disallow participant to unmute themselves and disable chat. So it would be convinient if ZAM could
automatically configure Zoom meeting.


## How to Use

You will need to do is:
1. Open Zoom Web Client [app.zoom.us/wc](https://app.zoom.us/wc):
   
  <img width="500" alt="Zoom Web Client" src="https://github.com/AlexFreik/zam/assets/61039123/f0c15a18-6ae3-4272-ac18-86de2e4bb901">

3. Open a meeting and join the audio.

4. Open developer Console in Chrome browser and execute this line (press F12):
  ```js
  document.getElementById('webclient').contentWindow.document.body.appendChild(Object.assign(document.createElement('script'), { src: 'https://alexfreik.github.io/zam/script.js' }));
  ```
5. If a new ZAM window appears it means you are done!
   
   <img width="500" alt="Screenshot 2023-11-29 at 12 54 35" src="https://github.com/AlexFreik/zam/assets/61039123/43a91dfb-d221-4a3b-bfc2-7fc810d93954">


## Testing

To test just clone the repo and open test `html` files in the Chrome browser. ZAM window and Zoom Elements mocks will pop up. Just can check that everything works.
