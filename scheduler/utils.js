function getHourStr(hour) {
    console.assert(0 <= hour && hour <= 24, hour);
    if (hour <= 12) return hour + ' AM';
    return hour - 12 + ' PM';
}
function daysInMonth(year, month) {
    return new Date(year, (month + 1) % 12, 0).getDate();
}

function getFirstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}

function formatTime(num) {
    console.assert(num >= 0, num);
    if (num < 10) return '0' + num;
    return String(num);
}

function escapeHTML(str) {
    return new Option(str).innerHTML;
}

function getDateString(date, timeZone = 'Asia/Kolkata') {
    return new Date(date)
        .toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: timeZone,
        })
        .replace(' ', 'T');
}
