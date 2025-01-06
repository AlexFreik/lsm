const props = PropertiesService.getScriptProperties();

const CLIENT_ID = props.getProperty('CLIENT_ID');
const CLIENT_SECRET = props.getProperty('CLIENT_SECRET');

/**
 * Adds a custom menu with items to show the sidebar.
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
    SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('Show Sidebar', 'showSidebar')
        .addItem('Sign Out', 'signOut')
        .addItem('Add Selected Rows', 'addSelectedRows')
        .addItem('Log Token', 'logToken')
        .addToUi();
}

function showSidebar() {
    const service = getYouTubeService_();

    if (!service.hasAccess()) {
        const authorizationUrl = service.getAuthorizationUrl();
        const template = HtmlService.createTemplate(
            '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
                'Reopen the sidebar when the authorization is complete.',
        );
        template.authorizationUrl = authorizationUrl;
        const page = template.evaluate();
        SpreadsheetApp.getUi().showSidebar(page);
    } else {
        const template = HtmlService.createTemplate(
            'You are signed in as <?= email ?> and token is <?= token ?>',
        );
        template.email = Session.getEffectiveUser().getEmail();
        template.token = service.getAccessToken();
        const page = template.evaluate();
        SpreadsheetApp.getUi().showSidebar(page);
    }
}

function authCallback(request) {
    const service = getYouTubeService_();
    const isAuthorized = service.handleCallback(request);
    if (isAuthorized) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab.');
    }
}

function getToken_() {
    return getYouTubeService_().getAccessToken();
}

/**
 * Resets the API service, forcing re-authorization before
 * additional authorization-required API calls can be made.
 */
function signOut() {
    getYouTubeService_().reset();
}

/**
 * Gets an OAuth2 service configured for the GitHub API.
 * @return {OAuth2.Service} The OAuth2 service
 */
function getYouTubeService_() {
    // Create a new service with the given name. The name will be used when
    // persisting the authorized token, so ensure it is unique within the
    // scope of the property store.
    return (
        OAuth2.createService('youtube')

            // Set the endpoint URLs, which are the same for all Google services.
            .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
            .setTokenUrl('https://accounts.google.com/o/oauth2/token')

            // Set the client ID and secret, from the Google Developers Console.
            .setClientId(CLIENT_ID)
            .setClientSecret(CLIENT_SECRET)

            // Set the name of the callback function in the script referenced
            // above that should be invoked to complete the OAuth flow.
            .setCallbackFunction('authCallback')

            // Set the property store where authorized tokens should be persisted.
            .setPropertyStore(PropertiesService.getUserProperties())

            // Set the scopes to request (space-separated for Google services).
            .setScope([
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtubepartner',
                'https://www.googleapis.com/auth/youtubepartner-channel-audit',
            ])
    );
}

function getSelectedRowsData() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getActiveRange(); // Get the selected range
    const selectedRows = range.getRow(); // First row of the selection
    const lastSelectedRow = selectedRows + range.getNumRows() - 1; // Last row of the selection
    const numCols = sheet.getLastColumn(); // Get the number of columns
    const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0]; // Get headers from the first row
    const data = [];

    for (let row = selectedRows; row <= lastSelectedRow; row++) {
        // Skip the header row (assumed to be the first row)
        if (row === 1) continue;

        const rowData = sheet.getRange(row, 1, 1, numCols).getValues()[0];

        // Skip empty rows
        if (rowData.every((cell) => cell === '')) continue;

        // Create an object with header keys and row values
        const rowObject = {};
        headers.forEach((header, colIndex) => {
            rowObject[header] = rowData[colIndex];
        });

        data.push(rowObject);
    }

    console.log(JSON.stringify(data, null, 2)); // Log the result for debugging
    return data; // Return the array of row objects
}

function addSelectedRows() {
    const rows = getSelectedRowsData();
    rows.forEach((row) => {
        const broadcast = insertBroadcast(row);
        console.log(broadcast);
        const stream = insertStream(row);
        console.log(stream);
        const bind = bindBroadcast(broadcast.id, stream.id);
        console.log(bind);
    });
}
