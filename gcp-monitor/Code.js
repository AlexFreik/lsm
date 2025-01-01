const props = PropertiesService.getScriptProperties();

const GCLOUD_PROJECT_ID = props.getProperty('GCLOUD_PROJECT_ID');
const SERVICE_ACCOUNT_KEY = props.getProperty('SERVICE_ACCOUNT_KEY');
const RECIPIENT = props.getProperty('RECIPIENT');
const TEST_RECIPIENT = props.getProperty('TEST_RECIPIENT');

class Instance {
    constructor(id, name, hostname, startTime = -1, startedBy = '') {
        this.id = id;
        this.name = name;
        this.hostname = hostname;
        this.startTime = startTime;
        this.startedBy = startedBy;
    }

    get uptimeString() {
        if (this.startTime === -1) {
            return '';
        }

        const uptime = Math.floor((new Date() - this.startTime) / 1000);
        const s = uptime % 60;
        const m = Math.floor(uptime / 60) % 60;
        const h = Math.floor(uptime / 3600) % 24;
        const d = Math.floor(uptime / 3600 / 24);

        let str = `${s}s`;
        if (d !== 0 || h !== 0 || m !== 0) {
            str = `${m}m ` + str;
        }
        if (d !== 0 || h !== 0) {
            str = `${h}h ` + str;
        }
        if (d !== 0) {
            str = `${d}d ` + str;
        }

        return str;
    }

    get reminderMessage() {
        return (
            `Your Google Cloud instance ${this.name} (${this.hostname}) ` +
            `was started by <${this.startedBy}> and has been running for ${this.uptimeString}.\n` +
            `Consider shutting it down if you're not using it.`
        );
    }
}

function getAccessToken() {
    const serviceAccountKey = JSON.parse(SERVICE_ACCOUNT_KEY);

    const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds
    const claimSet = {
        iss: serviceAccountKey.client_email, // Service account email
        scope: 'https://www.googleapis.com/auth/cloud-platform', // Scopes for your API
        aud: 'https://oauth2.googleapis.com/token', // Audience for token request
        exp: now + 3600, // Token expiration (1 hour from now)
        iat: now, // Issued at
    };

    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    // Encode header and claim set in base64
    const base64Header = Utilities.base64EncodeWebSafe(JSON.stringify(header));
    const base64ClaimSet = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));

    // Create the unsigned JWT
    const unsignedJwt = `${base64Header}.${base64ClaimSet}`;

    // Sign the JWT using the service account private key
    const signature = Utilities.base64EncodeWebSafe(
        Utilities.computeRsaSha256Signature(unsignedJwt, serviceAccountKey.private_key),
    );

    // Create the signed JWT
    const signedJwt = `${unsignedJwt}.${signature}`;

    // Exchange the JWT for an access token
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const payload = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt,
    };

    const options = {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        payload: Object.keys(payload)
            .map((key) => `${key}=${encodeURIComponent(payload[key])}`)
            .join('&'),
    };

    const response = UrlFetchApp.fetch(tokenUrl, options);
    const tokenData = JSON.parse(response.getContentText());

    return tokenData.access_token; // Return the Bearer token
}

function getRunningInstances() {
    const computeUrl = `https://compute.googleapis.com/compute/v1/projects/${GCLOUD_PROJECT_ID}/aggregated/instances`;
    const loggingUrl = `https://logging.googleapis.com/v2/entries:list`;

    const GCLOUD_AUTH_TOKEN = getAccessToken();
    const options = {
        method: 'get',
        headers: {
            Authorization: `Bearer ${GCLOUD_AUTH_TOKEN}`,
        },
    };
    const response = UrlFetchApp.fetch(computeUrl, options);
    const data = JSON.parse(response.getContentText());
    const runningInstances = [];

    // Parse the response to get running instances
    for (const zone in data.items) {
        if (data.items[zone].instances) {
            data.items[zone].instances.forEach((instance) => {
                if (instance.status === 'RUNNING') {
                    const ip = instance.networkInterfaces[0].accessConfigs[0].natIP;
                    runningInstances.push(new Instance(instance.id, instance.name, ip));
                }
            });
        }
    }

    runningInstances.forEach((instance) => {
        const payload = {
            resourceNames: [`projects/${GCLOUD_PROJECT_ID}`],
            filter: `protoPayload.methodName="v1.compute.instances.start" AND resource.labels.instance_id=${instance.id}`,
            orderBy: 'timestamp desc',
            pageSize: 1,
        };

        const loggingOptions = {
            method: 'post',
            contentType: 'application/json',
            headers: {
                Authorization: `Bearer ${GCLOUD_AUTH_TOKEN}`,
            },
            payload: JSON.stringify(payload),
        };

        const loggingResponse = UrlFetchApp.fetch(loggingUrl, loggingOptions);
        const loggingData = JSON.parse(loggingResponse.getContentText());

        if (loggingData.entries && loggingData.entries.length > 0) {
            const startTime = new Date(loggingData.entries[0].timestamp);
            const startedBy = loggingData.entries[0].protoPayload.authenticationInfo.principalEmail;
            instance.startTime = startTime;
            instance.startedBy = startedBy;
        } else {
            instance.startTime = -1;
        }
    });

    return runningInstances;
}

function getSummeryEmail(running) {
    const subject = 'GCP Reminder: ' + running.map((_) => _.name).join(', ');
    const body =
        'Namaskaram,\n\n' +
        running.map((_) => _.reminderMessage).join('\n\n') +
        '\n\nPranam,\nGCP Monitoring Script';
    return {
        subject: subject,
        body: body,
    };
}

function sendReminderEmail() {
    const running = getRunningInstances();
    if (running.length === 0) {
        return;
    }
    const { subject, body } = getSummeryEmail(running);
    MailApp.sendEmail(RECIPIENT, subject, body);
    MailApp.sendEmail(TEST_RECIPIENT, subject, body);
}
