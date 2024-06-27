// ===== Sidebar Utils =====
function showSidebar() {
    document.getElementById('drawer-checkbox').checked = true;
}

function hideSidebar() {
    document.getElementById('drawer-checkbox').checked = false;
}

function toggleDateView(month, date, isMax) {
    const maxView = document.getElementById(`max-${month}-${date}`);
    const minView = document.getElementById(`min-${month}-${date}`);

    maxView.classList.remove(isMax ? 'hidden' : 'grid');
    maxView.classList.add(isMax ? 'grid' : 'hidden');

    minView.classList.remove(isMax ? 'grid' : 'hidden');
    minView.classList.add(isMax ? 'hidden' : 'grid');
}

function renderSidebar(event, columnNames) {
    const sidebarElem = document.getElementById('sidebar-body');
    let sidebarHtml = `
      <li class="mb-5 w-fit">
        <div class="text-xl text-secondary inline-block align-middle">Table Row: <span class="font-semibold">${event.row}</span></div>

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
                      ${colors.map((c) => `<option value="${c.id}" ${a.color === c.id ? 'selected' : ''}>${c.id}</option>`)}
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
