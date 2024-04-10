ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const urlParams = new URLSearchParams(window.location.search);
let idParam = urlParams.get('id');
let pwdParam = urlParams.get('pwd');

const authEndpoint = 'https://meetingsdk-auth-endpoint-2v0x.onrender.com';
const sdkKey = 'LulHW4M5Rnes22C4JSig';
const meetingNumber = idParam ? idParam : '';
const passWord = pwdParam ? pwdParam : '';
const role = 0;
const userName = 'JavaScript';
const userEmail = '';
const registrantToken = '';
const zakToken = '';
const leaveUrl = '../zoom-sdk';

function getSignature() {
    fetch(authEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            meetingNumber: meetingNumber,
            role: role,
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            startMeeting(data.signature);
        })
        .catch((error) => {
            console.log(error);
        });
}

function startMeeting(signature) {
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
        leaveUrl: leaveUrl,
        patchJsMedia: true,
        success: (success) => {
            console.log(success);
            console.log('Joining meeting ' + meetingNumber + ' with a password ' + passWord);
            ZoomMtg.join({
                signature: signature,
                sdkKey: sdkKey,
                meetingNumber: meetingNumber,
                passWord: passWord,
                userName: userName,
                userEmail: userEmail,
                tk: registrantToken,
                zak: zakToken,
                success: (success) => {
                    console.log(success);
                },
                error: (error) => {
                    console.log(error);
                },
            });
        },
        error: (error) => {
            console.log(error);
        },
    });
}
