class SubEvent {
    /**
     * @param {object} event
     * @param {string} room
     * @param {date} start
     * @param {date} end
     * @param {boolean} dryrun
     */
    constructor(event, room, start, end, color) {
        this.event = event;
        this.room = room;
        this.start = start;
        this.end = end;
        this.color = color;
    }
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
        e.alloc.forEach((a) => flat.push(new SubEvent(e, a.room, a.start, a.end, a.color)));
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

// ===== Sidebar Utils =====
function showSidebar() {
    document.getElementById('drawer-checkbox').checked = true;
}

function hideSidebar() {
    document.getElementById('drawer-checkbox').checked = false;
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

function toggleDateView(month, date, isMax) {
    const maxView = document.getElementById(`max-${month}-${date}`);
    const minView = document.getElementById(`min-${month}-${date}`);

    maxView.classList.remove(isMax ? 'hidden' : 'grid');
    maxView.classList.add(isMax ? 'grid' : 'hidden');

    minView.classList.remove(isMax ? 'grid' : 'hidden');
    minView.classList.add(isMax ? 'hidden' : 'grid');
}

// ===== Page Rendering =====
function renderSidebar(event, columnNames) {
    const sidebarElem = document.getElementById('sidebar-body');
    let sidebarHtml = `
      <li class="mb-5 w-fit">
        <div class="text-xl text-secondary inline-block align-middle">Table Row: <span class="font-semibold">05</span></div>

        <div class="inline-block align-middle w-[35px]"></div>
        <button onclick="hideSidebar();" class="btn btn-outline btn-sm inline-block align-middle">cancel</button>
        <button onclick="hideSidebar();" class="btn btn-secondary btn-sm text-right inline-block align-middle">save</button>
      </li>`;

    columnNames.forEach((name, i) => {
        const value = event.details[i];
        if (value === '' && i !== columnNumbers.alloc) return;

        sidebarHtml += `<li class="text-xl"><span class="text-secondary">${i}</span>&nbsp; ${escapeHTML(name)}</li>`;
        sidebarHtml += `<li class="mb-2 text-gray-500">`;
        if (i === columnNumbers.alloc) {
            event.alloc.forEach((a) => {
                console.assert(a.room);
                sidebarHtml += `
                <div class="rounded-box border w-fit mb-2 px-2 border-neutral-content">
                  <div class="inline-block align-middle ">
                    <select class="select w-16 select-sm pl-0">
                      <option value='' disabled>Room</option>
                      ${rooms.map((r) => `<option value="${r.id}" ${a.room === r.id ? 'selected' : ''}>${r.id}</option>`)}
                    </select>
                    <br />
                    <select class="select w-16 select-sm pl-0 ">
                      <option value='' disabled>Color</option>
                      ${colors.map((c) => `<option value="${c}" ${a.color === c ? 'selected' : ''}>${c}</option>`)}
                    </select>
                  </div>
                  <div class="inline-block align-middle">
                    <input
                      type="datetime-local"
                      class="input input-sm px-0 w-[150px]"
                      value="${getDateString(a.start)}" />
                    <br />
                    <input
                      type="datetime-local"
                      class="input input-sm px-0 w-[150px]"
                      value="${getDateString(a.end)}" />
                  </div>

                  <button class="btn btn-outline btn-xs inline-block align-middle">remove</button>
                </div>`;
            });
            sidebarHtml += `
              <div class="w-[326px] text-center">
                <button class="btn btn-secondary btn-xs mx-auto">add</button>
              </div>`;
        } else if (i === columnNumbers.startDate) {
            sidebarHtml += getDateString(event.details[i]).split('T')[0];
        } else if (i === columnNumbers.startTime || i === columnNumbers.endTime) {
            sidebarHtml += getDateString(event.details[i]).split('T')[1];
        } else {
            sidebarHtml += escapeHTML(value);
        }
    });
    sidebarHtml += `</li>`;
    sidebarElem.innerHTML = sidebarHtml;
}

function renderCalendar(year, month, eventGroups) {
    const calendar = document.getElementById('calendar');

    const monthStr = new Date(year, month, 1).toLocaleString('en-US', { month: 'short' });

    let calendarHtml = `
      <div class="m-3 grid grid-cols-[90px_auto] gap-2.5 sticky top-0">
        <div class="col-start-2 grid grid-cols-[repeat(6,200px)_400px] gap-1 bg-base-100">`;
    rooms.forEach((r) => {
        calendarHtml += `
      <div class="h-[50px] flex gap-4">
        <p class="inline text-3xl font-semibold">${r.id}</p>
        <p class="inline font-thin">${r.description}</p>
    </div>`;
    });
    calendarHtml += '</div>';

    calendarHtml += '</div>';

    for (let i = 1; i < eventGroups.length; i++) {
        const dayStr = new Date(year, month, i).toLocaleString('en-US', { weekday: 'short' });

        // ===== Minimized View =====
        calendarHtml += `<div id="min-${month}-${i}" class="m-3 grid grid-cols-[auto_auto] gap-2.5">`;

        // Date
        calendarHtml += `
          <div class="grid grid-rows-[repeat(1,_50px)] grid-cols-[repeat(1,90px)]">
            <div
              onclick="toggleDateView(${month}, ${i}, true)"
              class="w-[80px] h-[40px] m-auto text-center rounded-xl bg-neutral-content
                  text-neutral cursor-pointer">
              <div class="font-mono text-lg font-bold">${i} ${monthStr}</div>
              <div class="font-mono -mt-2">${dayStr}</div>
            </div>
          </div>`;

        // Rooms
        calendarHtml += `<div class="col-start-2 grid grid-cols-[repeat(6,200px)_400px] gap-1">`;
        rooms.forEach((r) => {
            calendarHtml += ` <div class="rounded-md bg-neutral" id="min-events-${i}-${r.id}"></div>`;
        });
        calendarHtml += '</div>';

        calendarHtml += '</div>';

        // ===== Maximised View =====
        const group = eventGroups[i];

        const range = group.length === 0 ? { minH: 5, maxH: 5 } : getTimelineRange(group);
        let scale = range.maxH - range.minH;
        console.assert(scale >= 0, range.minH, range.maxH);

        calendarHtml += `<div id="max-${month}-${i}" class="m-3 hidden grid-cols-[auto_auto] gap-2.5">`;

        // Date
        calendarHtml += `
          <div
            onclick="toggleDateView(${month}, ${i}, false)"
            id="timeline"
            class="grid col-start-2 grid-rows-[repeat(1,30px)] grid-cols-[auto]]
              rounded-xl bg-neutral-content cursor-pointer">
            <div class="h-[30px] m-auto text-center text-neutral">
              <span class="font-mono text-lg font-bold">${i} ${monthStr}</span>
              <span class="font-mono -mt-2">${dayStr}</span>
            </div>
          </div>`;

        // Timeline
        calendarHtml += `
          <div class="grid grid-rows-[repeat(1,_50px)] grid-cols-[repeat(1,90px)]">`;
        for (let i = 0; i < scale; i++) {
            calendarHtml += `
          <div class="border-t border-dashed border-neutral-content text-right">${getHourStr(range.minH + i)}</div>`;
        }
        calendarHtml += `</div>`;

        // Rooms
        calendarHtml += `<div class="col-start-2 grid grid-cols-[repeat(6,200px)_400px] gap-1">`;
        rooms.forEach((r) => {
            calendarHtml += `
              <div
                class="grid grid-rows-[repeat(${scale * 2},_25px)] rounded-md bg-neutral"
                id="max-events-${i}-${r.id}">
              </div>`;
        });
        calendarHtml += '</div>';

        calendarHtml += '</div>';
    }
    calendar.innerHTML = calendarHtml;
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

            const eventElem = document.createElement('div');
            eventElem.className = `bg-neutral-content text-base-300 px-1 my-0 text-sm max-w-[200px]
              rounded-md border border-base-300 cursor-pointer row-start-[${startRow}] row-end-[${endRow}]`;
            eventElem.innerHTML += `
              <p class="font-semibold">${e.event.name}</p>
              <p>${formatTime(startH)}:${formatTime(startM)} - ${formatTime(endH)}:${formatTime(endM)}
                (${e.event.lang})</p>`;
            eventElem.addEventListener('dblclick', () => {
                hideSidebar();
                renderSidebar(e.event, columnNames);
                showSidebar();
            });
            const roomEvents = document.getElementById('max-events-' + i + '-' + e.room);
            roomEvents.appendChild(eventElem);

            const eventElemMin = document.createElement('div');
            eventElemMin.className = `bg-neutral-content text-base-300 px-1 my-0 text-sm max-w-[200px]
              rounded-md border border-base-300 cursor-pointer`;
            eventElemMin.innerHTML += `
              <p class="font-semibold">${e.event.name}</p>
              <p>${formatTime(startH)}:${formatTime(startM)} - ${formatTime(endH)}:${formatTime(endM)}
                (${e.event.lang})</p>`;
            eventElemMin.addEventListener('dblclick', () => {
                hideSidebar();
                renderSidebar(e.event, columnNames);
                showSidebar();
            });
            const roomEventsMin = document.getElementById('min-events-' + i + '-' + e.room);
            roomEventsMin.appendChild(eventElemMin);
        });
    }
}

function renderPage(data) {
    const parsedData = JSON.parse(data);
    events = parsedData.events;
    columnNames = parsedData.columnNames;
    columnNumbers = parsedData.columnNumbers;
    rooms = parsedData.rooms;
    colors = parsedData.colors;

    events.forEach((e) => {
        e.alloc.forEach((a) => {
            a.room = String(a.room);
            a.start = new Date(a.start);
            a.end = new Date(a.end);
        });
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const subEvents = flattenEvents(events);
    const eventGroups = groupEvents(year, month, subEvents);
    renderCalendar(year, month, eventGroups);
    renderEvents(eventGroups);
}

let events = null;
let columnNames = null;
let columnNumbers = null;
let rooms = null;
let colors = null;

if (typeof google !== 'undefined') {
    // Prod mode
    google.script.run.withSuccessHandler((data) => renderPage(data)).getEvents();
} else {
    // Dev mode
    renderPage(getEventsMock());
}
