const ROOMS = [
    { id: '131', description: 'Storage' },
    { id: '132', description: '' },
    { id: '133', description: 'Monitoring' },
    { id: '134', description: '' },
    { id: '135', description: '' },
    { id: '136', description: '' },
    { id: 'Upcoming', description: '' },
];

class SubEvent {
    /**
     * @param {object} event
     * @param {string} room
     * @param {date} start
     * @param {date} end
     * @param {boolean} dryrun
     */
    constructor(event, room, start, end, dryrun) {
        this.event = event;
        this.room = room;
        this.start = start;
        this.end = end;
        this.dryrun = dryrun;
    }
}

function getEvents() {
    return [
        {
            name: 'IE 7 days',
            lang: 'English',
            allocation: [
                [],
                [
                    [
                        '131',
                        new Date('2024-06-07T13:30:00.000Z'),
                        new Date('2024-06-07T15:30:00.000Z'),
                    ],
                ],
            ],
            details: [],
        },
        {
            name: 'Sadhguru Sahabhagi',
            lang: 'Hindi',
            allocation: [
                [],
                [
                    [
                        '132',
                        new Date('2024-06-07T01:30:00.000Z'),
                        new Date('2024-06-07T05:00:00.000Z'),
                    ],
                ],
            ],
            details: [],
        },
        {
            name: 'Sadhguru Sahabhagi',
            lang: 'Hindi',
            allocation: [
                [],
                [
                    [
                        '132',
                        new Date('2024-06-08T01:30:00.000Z'),
                        new Date('2024-06-08T05:00:00.000Z'),
                    ],
                ],
            ],
            details: [],
        },
    ];
}

// ===== General Utils =====
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

// ===== Events Utils =====
function flattenEvents(events) {
    const flat = [];
    events.forEach((e) => {
        e.allocation[0].forEach((a) => flat.push(new SubEvent(e, a[0], a[1], a[2], true)));
        e.allocation[1].forEach((a) => flat.push(new SubEvent(e, a[0], a[1], a[2], false)));
    });
    return flat;
}

// TODO: handle case when event spans over 2 days
function groupEvents(year, month, events) {
    const daysNum = daysInMonth(year, month);
    const eventsByDate = Array(daysNum + 1)
        .fill()
        .map((_) => []);
    events
        .filter((e) => e.start.getFullYear() === year)
        .filter((e) => e.start.getMonth() >= month && e.end.getMonth() <= month)
        .forEach((e) => {
            const date = e.start.getDate();
            console.assert(eventsByDate.length > date);
            eventsByDate[date].push(e);
        });
    return eventsByDate;
}

function getTimelineRange(events) {
    const minTime = Math.min(...events.map((e) => e.start.getTime()));
    const maxTime = Math.max(...events.map((e) => e.end.getTime()));

    const minH = new Date(minTime).getHours();
    let maxH = new Date(maxTime).getHours();
    if (new Date(maxTime).getMinutes() !== 0) maxH += 1;
    return { minH: minH, maxH: maxH };
}

// ===== Page Rendering =====
function renderCalendar(year, month, eventGroups) {
    const calendar = document.getElementById('calendar');

    const monthStr = new Date(year, month, 1).toLocaleString('en-US', { month: 'short' });

    for (let i = 1; i < eventGroups.length; i++) {
        const dayStr = new Date(year, month, i).toLocaleString('en-US', { weekday: 'short' });
        calendar.innerHTML += `
          <div
            class="m-auto w-[200px] text-center rounded-xl bg-neutral-content text-2xl font-bold text-neutral font-mono">
            ${i} ${monthStr}: ${dayStr}
          </div>`;

        const group = eventGroups[i];
        if (group.length === 0) {
            calendar.innerHTML += `<div class="text-center">No events...</div>`;
            continue;
        }

        const container = document.createElement('div');
        container.className = 'm-8 grid grid-cols-[auto_1fr] gap-2.5';
        calendar.appendChild(container);

        const range = getTimelineRange(group);
        let scale = range.maxH - range.minH;
        console.assert(scale > 0, range.minH, range.maxH);

        let timeline =
            '<div id="timeline" class="grid grid-rows-[repeat(1,_50px)] grid-cols-[repeat(1,50px)]"><div></div>';
        for (let i = 0; i < scale; i++) {
            timeline += `
          <div class="border-t border-dashed border-neutral-content">${getHourStr(range.minH + i)}</div>`;
        }
        timeline += `</div>`;
        container.innerHTML = timeline;

        let rooms = '<div class="col-start-2 grid grid-cols-[repeat(7,200px)] gap-1">';
        ROOMS.forEach((r) => {
            rooms += `
        <div>
          <div class="h-[50px] flex gap-4">
            <p class="inline text-3xl font-semibold">${r.id}</p>
            <p class="inline font-thin">${r.description}</p>
          </div>
          <div class="grid grid-rows-[repeat(${scale * 2},_25px)] rounded-md bg-neutral" id="events-${i}-${r.id}"></div>
        </div>`;
        });
        rooms += '</div>';
        container.innerHTML += rooms;
    }
}

function renderEvents(eventGroups) {
    for (let i = 1; i < eventGroups.length; i++) {
        const group = eventGroups[i];
        if (group.length === 0) {
            continue;
        }

        const range = getTimelineRange(group);
        group.forEach((e) => {
            const startH = e.start.getHours();
            const startM = e.start.getMinutes();
            let startRow = (startH - range.minH) * 2 + 1;
            if (startM > 15) startRow += 1;
            else if (startM > 45) startRow += 2;

            const endH = e.end.getHours();
            const endM = e.end.getMinutes();
            let endRow = (endH - range.minH) * 2 + 1;
            if (endM > 15) endRow += 1;
            else if (endM > 45) endRow += 2;

            const roomEvents = document.getElementById('events-' + i + '-' + e.room);
            roomEvents.innerHTML += `
            <div class="bg-neutral-content text-base-300 p-2 my-0 mx-2
              rounded-md border border-base-300 row-start-[${startRow}] row-end-[${endRow}]">
              <p class="mb-1 font-semibold">${e.event.name}</p>
              <p>${formatTime(startH)}:${formatTime(startM)} - ${formatTime(endH)}:${formatTime(endM)} (${e.event.lang})</p>
            </div>`;
        });
    }
}

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const events = getEvents();
const subEvents = flattenEvents(events);
const eventGroups = groupEvents(year, month, subEvents);

renderCalendar(year, month, eventGroups);
renderEvents(eventGroups);

// Please ignore this string, it is needed for tailwind to generate classes since we render them dynamically
` grid-rows-[repeat(2,_25px)] grid-rows-[repeat(4,_25px)] grid-rows-[repeat(6,_25px)]
  grid-rows-[repeat(8,_25px)] grid-rows-[repeat(10,_25px)] grid-rows-[repeat(12,_25px)]
  grid-rows-[repeat(14,_25px)] grid-rows-[repeat(16,_25px)] grid-rows-[repeat(18,_25px)]
  grid-rows-[repeat(20,_25px)] grid-rows-[repeat(22,_25px)] grid-rows-[repeat(24,_25px)]
  grid-rows-[repeat(26,_25px)] grid-rows-[repeat(28,_25px)] grid-rows-[repeat(30,_25px)]
  grid-rows-[repeat(32,_25px)] grid-rows-[repeat(34,_25px)] grid-rows-[repeat(36,_25px)]
  grid-rows-[repeat(38,_25px)] grid-rows-[repeat(40,_25px)] grid-rows-[repeat(42,_25px)]
  grid-rows-[repeat(44,_25px)] grid-rows-[repeat(46,_25px)] grid-rows-[repeat(48,_25px)]
  row-start-[1] row-start-[2] row-start-[3] row-start-[4] row-start-[5] row-start-[6] row-start-[7] row-start-[8]
  row-start-[9] row-start-[10] row-start-[11] row-start-[12] row-start-[13] row-start-[14] row-start-[15] row-start-[16]
  row-start-[17] row-start-[18] row-start-[19] row-start-[20] row-start-[21] row-start-[22] row-start-[23] row-start-[24]
  row-start-[25] row-start-[26] row-start-[27] row-start-[28] row-start-[29] row-start-[30] row-start-[31] row-start-[32]
  row-start-[33] row-start-[34] row-start-[35] row-start-[36] row-start-[37] row-start-[38] row-start-[39] row-start-[40]
  row-start-[41] row-start-[42] row-start-[43] row-start-[44] row-start-[45] row-start-[46] row-start-[47] row-start-[48]
  row-end-[1] row-end-[2] row-end-[3] row-end-[4] row-end-[5] row-end-[6] row-end-[7] row-end-[8]
  row-end-[9] row-end-[10] row-end-[11] row-end-[12] row-end-[13] row-end-[14] row-end-[15] row-end-[16]
  row-end-[17] row-end-[18] row-end-[19] row-end-[20] row-end-[21] row-end-[22] row-end-[23] row-end-[24]
  row-end-[25] row-end-[26] row-end-[27] row-end-[28] row-end-[29] row-end-[30] row-end-[31] row-end-[32]
  row-end-[33] row-end-[34] row-end-[35] row-end-[36] row-end-[37] row-end-[38] row-end-[39] row-end-[40]
  row-end-[41] row-end-[42] row-end-[43] row-end-[44] row-end-[45] row-end-[46] row-end-[47] row-end-[48]`;
