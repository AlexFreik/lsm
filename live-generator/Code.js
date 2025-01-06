const props = PropertiesService.getScriptProperties();

const CLIENT_ID = props.getProperty('CLIENT_ID');
const CLIENT_SECRET = props.getProperty('CLIENT_SECRET');
const SPREADSHEET_ID = props.getProperty('SPREADSHEET_ID');
const KEY_SHEET_NAME = 'Keys';
const SCHEDULE_SHEET_NAME = 'Schedule';

// ===== Sidebar =====
function onOpen(e) {
    SpreadsheetApp.getUi().createAddonMenu().addItem('Show Sidebar', 'showSidebar').addToUi();
}

function showSidebar() {
    const service = getYouTubeService_();
    const template = HtmlService.createTemplateFromFile('Sidebar');
    template.authorizationUrl = service.getAuthorizationUrl();

    const page = template.evaluate().setTitle('Live Generator');
    SpreadsheetApp.getUi().showSidebar(page);
}

function getUserEmail() {
    return Session.getEffectiveUser().getEmail();
}

// ===== Spreadsheet Logic =====
function getColumnIndex(sheet, columnName) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return headers.indexOf(columnName) + 1; // Add 1 because indexOf() is 0-based
}

function scheduleBroadcasts() {
    const rows = getSelectedRows();

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SCHEDULE_SHEET_NAME);
    const broadcastIdColumn = getColumnIndex(sheet, 'Broadcast ID');
    for (let row of rows) {
        try {
            const broadcast = insertBroadcast(row);
            bindBroadcast(broadcast.id, row['Key ID']);

            const broadcastIdCell = sheet.getRange(row.row, broadcastIdColumn);
            broadcastIdCell.setValue(broadcast.id);
            broadcastIdCell.setBackground('#fce5cd');
        } catch (e) {
            const broadcastIdCell = sheet.getRange(row.row, broadcastIdColumn);
            broadcastIdCell.setBackground('red');
            throw e;
        }
    }
    return `Successfully added ${rows.length} broadcasts.`;
}

function updateStreamKeys() {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(KEY_SHEET_NAME);
    const data = getStreams().map((item) => [item.id, item.title, item.key]);

    const currentRows = sheet.getLastRow();
    if (currentRows > 2) {
        sheet.deleteRows(2, currentRows - 1);
    }
    if (data.length > 0) {
        sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    }

    return `Successfully refreshed ${data.length} keys`;
}

function getSelectedRows() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getActiveRange(); // Get the selected range
    const selectedRows = range.getRow(); // First row of the selection
    const lastSelectedRow = selectedRows + range.getNumRows() - 1; // Last row of the selection
    const numCols = sheet.getLastColumn(); // Get the number of columns
    const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0]; // Get headers from the first row
    const data = [];

    for (let row = selectedRows; row <= lastSelectedRow; row++) {
        if (row === 1) continue;
        const rowData = sheet.getRange(row, 1, 1, numCols).getValues()[0];
        if (rowData.every((cell) => cell === '')) continue;
        const rowObject = { row: row };
        headers.forEach((header, colIndex) => {
            rowObject[header] = String(rowData[colIndex]).trim();
        });
        data.push(rowObject);
    }

    formatBroadcastData(data);
    console.log(JSON.stringify(data, null, 2));
    return data;
}

// ===== Validations & Formating =====
function isNonNegativeInteger(str) {
    return /^\d+$/.test(str);
}

function validateNumber(str, min, max) {
    if (str === '') {
        return true;
    }
    if (!isNonNegativeInteger(str)) return false;

    const num = parseInt(str);
    return min <= num && num <= max;
}

function getValidationError(row, msg) {
    return new Error(`[Invalid row #${row}] ${msg}.`);
}

function pad(str, length = 2) {
    return String(Number(str)).padStart(length, '0');
}

function formatBroadcastData(data) {
    const now = new Date(Date.now() + 2 * (60 * 60 * 1000));

    for (let row of data) {
        if (row.Title === '') {
            throw getValidationError(row.row, "Title can't be empty");
        } else if (!validateNumber(row.Year, 2000, 2100)) {
            throw getValidationError(row.row, 'Year value shold be between 2000 and 2100');
        } else if (!validateNumber(row.Month, 1, 12)) {
            throw getValidationError(row.row, 'Month value shold be between 1 and 12');
        } else if (!validateNumber(row.Day, 1, 31)) {
            throw getValidationError(row.row, 'Day value shold be between 1 and 31');
        } else if (!validateNumber(row.Hour, 0, 23)) {
            throw getValidationError(row.row, 'Hour value shold be between 0 and 23');
        } else if (!validateNumber(row.Minute, 0, 59)) {
            throw getValidationError(row.row, 'Minute value shold be between 0 and 59');
        } else if (row.Visibility === '') {
            throw getValidationError(row.row, 'Visibility is not defined');
        } else if (row['Key ID'] === '') {
            throw getValidationError(row.row, 'Key ID is not defined');
        } else if (row['Broadcast ID'] !== '') {
            throw getValidationError(row.row, 'Broadcast ID is alfready set');
        }

        row.Year = pad(row.Year === '' ? now.getFullYear() : row.Year, 4);
        row.Month = pad(row.Month === '' ? now.getMonth() + 1 : row.Month);
        row.Day = pad(row.Day === '' ? now.getDate() : row.Day);
        row.Hour = pad(row.Hour === '' ? now.getHours() : row.Hour);
        row.Minute = pad(row.Minute === '' ? 0 : row.Minute);
        row.DVR = Boolean(row.DVR);
        row['Auto Start'] = Boolean(row['Auto Start']);
        row['Auto Stop'] = Boolean(row['Auto Stop']);
    }
}
