ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');
const pwdParam = urlParams.get('pwd');
const tkParam = urlParams.get('tk');

const authEndpoint = 'https://meetingsdk-auth-endpoint-1.onrender.com';
const sdkKey = 'twP7kAS2T8iGhkMketu9Ng';
const meetingNumber = idParam ? idParam : '';
const passWord = pwdParam ? pwdParam : '';
const role = 0;
const userName = 'LS Gallery';
const userEmail = 'ls.gallery@ishafoundation.org';
const registrantToken = tkParam ? tkParam : '';
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
            console.log(
                'Joining meeting ' +
                    meetingNumber +
                    ' with a password ' +
                    passWord +
                    'and a tk ' +
                    registrantToken,
            );
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
