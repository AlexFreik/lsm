ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get('id');
const pwdParam = urlParams.get('pwd');
const roleParam = urlParams.get('role');
const tkParam = urlParams.get('tk');
const authParam = urlParams.get('zoomAuthEndpoint');
const sdkParam = urlParams.get('zoomSdkKey');

console.assert(idParam, 'Error: Meeting number is not defined');
console.assert(['0', '1'].includes(roleParam), 'Error: Role is not defined');
console.assert(authParam, 'Error: Auth Endpoint is not defined');
console.assert(sdkParam, 'Error: SDK Key is not defined');

const authEndpoint = authParam;
const sdkKey = sdkParam ? sdkParam : '';
const meetingNumber = idParam ? idParam : '';
const passWord = pwdParam ? pwdParam : '';
const role = roleParam === '1' ? 1 : 0;
const userName = 'LS Gallery';
const userEmail = 'ls@gallery.com';
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
