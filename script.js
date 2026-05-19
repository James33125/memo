
let currentDate = new Date();
let selectedDateStr = "";
let memoStorage = JSON.parse(localStorage.getItem('premium_memo_app') || '{}');

const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateLabel = document.getElementById('selected-date-label');
const memoInput = document.getElementById('memo-input');
const saveBtn = document.getElementById('save-btn');
const memoOutput = document.getElementById('memo-output');
const exportBtn = document.getElementById('export-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

function init() {
    const today = new Date();
    selectedDateStr = formatDate(today);
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
    updateMemoDisplay();
    
    document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));
    saveBtn.addEventListener('click', saveMemo);
    exportBtn.addEventListener('click', exportData);
    clearAllBtn.addEventListener('click', clearAllData);
    memoInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo();
    });
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    calendarTitle.innerText = `${year}年 ${month + 1}月`;

    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'weekday';
        dayEl.innerText = day;
        calendarGrid.appendChild(dayEl);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'day empty';
        calendarGrid.appendChild(emptyEl);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day font-semibold text-slate-700';
        dayEl.innerText = day;
        const dateStr = formatDate(new Date(year, month, day));

        if (memoStorage[dateStr]?.length > 0) dayEl.classList.add('has-memo');
        if (dateStr === selectedDateStr) dayEl.classList.add('selected');

        dayEl.addEventListener('click', () => {
            selectedDateStr = dateStr;
            document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
            dayEl.classList.add('selected');
            updateMemoDisplay();
        });
        calendarGrid.appendChild(dayEl);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function updateMemoDisplay() {
    const dateObj = new Date(selectedDateStr);
    selectedDateLabel.innerText = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${weekdays[dateObj.getDay()]})`;
    memoOutput.innerHTML = '';
    const dayMemos = memoStorage[selectedDateStr] || [];

    if (dayMemos.length === 0) {
        memoOutput.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic flex flex-col items-center gap-2"><i class="fa-regular fa-folder-open text-2xl text-slate-300"></i>この日のメモはまだありません。</div>`;
        return;
    }

    dayMemos.forEach((memo) => {
        const memoItem = document.createElement('div');
        memoItem.className = 'group bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-start gap-4 hover:bg-slate-100/70 transition-all duration-200';
        memoItem.innerHTML = `
            <div class="flex-1">
                <div class="text-xs font-bold text-indigo-500 mb-1 flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${memo.time}</div>
                <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">${escapeHTML(memo.text)}</div>
            </div>
            <button class="delete-btn text-slate-300 hover:text-rose-500 p-1 rounded transition-all opacity-0 group-hover:opacity-100" data-id="${memo.id}"><i class="fa-solid fa-trash"></i></button>
        `;
        memoItem.querySelector('.delete-btn').addEventListener('click', () => deleteMemo(memo.id));
        memoOutput.appendChild(memoItem);
    });
}

function saveMemo() {
    const text = memoInput.value.trim();
    if (!text) return;
    const now = new Date();
    if (!memoStorage[selectedDateStr]) memoStorage[selectedDateStr] = [];
    memoStorage[selectedDateStr].push({
        id: Math.random().toString(36).substring(2, 9),
        time: `${String(now.getHours()).padStart(2, '0')}時${String(now.getMinutes()).padStart(2, '0')}分`,
        text: text
    });
    localStorage.setItem('premium_memo_app', JSON.stringify(memoStorage));
    memoInput.value = '';
    renderCalendar();
    updateMemoDisplay();
}

function deleteMemo(id) {
    memoStorage[selectedDateStr] = memoStorage[selectedDateStr].filter(m => m.id !== id);
    if (memoStorage[selectedDateStr].length === 0) delete memoStorage[selectedDateStr];
    localStorage.setItem('premium_memo_app', JSON.stringify(memoStorage));
    renderCalendar();
    updateMemoDisplay();
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memoStorage, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `memo_backup_${formatDate(new Date())}.json`);
    a.click();
}

function clearAllData() {
    if (confirm('すべてのデータが端末から完全に削除されます。よろしいですか？')) {
        memoStorage = {};
        localStorage.setItem('premium_memo_app', JSON.stringify(memoStorage));
        renderCalendar();
        updateMemoDisplay();
    }
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

init();
