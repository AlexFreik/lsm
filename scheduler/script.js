function getRequests() {
    return JSON.parse(`[
    ["Program Name","Program Language","Start Date","Session Start Time (including Yogapadhi)","Session End Time (including Yogapadhi)","Studio Number"],
    ["Name","Hindi","2024-06-06T18:30:00.000Z","1899-12-30T13:08:50.000Z","1899-12-30T15:38:50.000Z",132]
  ]`);
}

const ROOMS = [
    { number: '131', description: 'Storage' },
    { number: '132', description: '' },
    { number: '133', description: 'Monitoring' },
    { number: '134', description: '' },
    { number: '135', description: '' },
    { number: '136', description: '' },
    { number: 'Upcoming', description: '' },
];
const requests = getRequests();

const calendar = document.getElementById('calendar');
