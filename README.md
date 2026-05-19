// 状態管理
let currentDate = new Date();
let selectedDateStr = "";
let currentSelectedTag = "study"; // デフォルトタグ
let searchQuery = ""; // 検索キーワード

// ローカルストレージからデータをロード
let memoStorage = JSON.parse(localStorage.getItem('ultimate_memo_app') || '{}');

// DOM要素の取得
const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateLabel = document.getElementById('selected-date-label');
const memoInput = document.getElementById('memo-input');
const saveBtn = document.getElementById('save-btn');
const memoOutput = document.getElementById('memo-output');
const searchInput = document.getElementById('search-input');
const searchResultsCount = document.getElementById('search-results-count');
const charCountDisplay = document.getElementById('char-count');
const charProgress = document.getElementById('char-progress');
const exportBtn = document.getElementById('export-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const importInput = document.getElementById('import-input');

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

// タグのスタイルマッピング辞書
const tagConfig = {
    study: { label: "📚 勉強", bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-300" },
    work: { label: "💼 タスク", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300" },
    idea: { label: "💡 アイデア", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300" },
    diary: { label: "📝 日記", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300" }
};

function init() {
    const today = new Date();
    selectedDateStr = formatDate(today);
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    renderCalendar();
    updateMemoDisplay();
    setupTagEventListeners();
    
    // イベントリスナー
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    saveBtn.addEventListener('click', saveMemo);
    exportBtn.addEventListener('click', exportData);
    clearAllBtn.addEventListener('click', clearAllData);
    
    // 全文検索のリアルタイム監視
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        updateMemoDisplay();
    });

    // 文字数カウンターの監視
    memoInput.addEventListener('input', updateCharCount);

    // インポート（ファイル読み込み）の監視
    importInput.addEventListener('change', importData);

    // ショートカットキー (Ctrl + Enter)
    memoInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo();
    });
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// タグ切り替えボタンのイベント登録
function setupTagEventListeners() {
    const tagButtons = document.querySelectorAll('.tag-select');
    tagButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tagButtons.forEach(b => {
                const tag = b.getAttribute('data-tag');
                b.className = `tag-select text-xs py-1 px-2.5 rounded-full border ${tagConfig[tag].border} bg-slate-950 text-slate-400`;
            });
            
            const selectedTag = e.target.getAttribute('data-tag');
            currentSelectedTag = selectedTag;
            
            // 選択されたボタンを光らせる
            e.target.className = `tag-select text-xs py-1 px-2.5 rounded-full border ${tagConfig[selectedTag].border} ${tagConfig[selectedTag].bg} ${tagConfig[selectedTag].text} active-tag`;
        });
    });
}

// 文字数カウンター＆プログレスバー計算
function updateCharCount() {
    const len = memoInput.value.length;
    charCountDisplay.innerText = len;
    // 200文字を目標値（100%）として進捗バーを伸ばす
    const percentage = Math.min((len / 200) * 100, 100);
    charProgress.style.width = `${percentage}%`;
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
        dayEl.className = 'day font-semibold';
        dayEl.innerText = day;
        const dateStr = formatDate(new Date(year, month, day));

        if (memoStorage[dateStr]?.length > 0) dayEl.classList.add('has-memo');
        if (dateStr === selectedDateStr) dayEl.classList.add('selected');

        dayEl.addEventListener('click', () => {
            selectedDateStr = dateStr;
            document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
            dayEl.classList.add('selected');
            // 検索ワードが入っている場合はクリアする（日付クリックを優先）
            if (searchQuery) {
                searchInput.value = "";
                searchQuery = "";
            }
            updateMemoDisplay();
        });
        calendarGrid.appendChild(dayEl);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

// メモ出力（通常表示 & 検索表示を兼用）
function updateMemoDisplay() {
    memoOutput.innerHTML = '';
    
    // 検索モードか個別日付表示モードかを判定
    if (searchQuery !== "") {
        searchResultsCount.classList.remove('hidden');
        selectedDateLabel.innerHTML = `<i class="fa-solid fa-search"></i> 検索結果モード`;
        
        let matchCount = 0;
        
        // 全ストレージからループ検索
        Object.keys(memoStorage).forEach(dateKey => {
            memoStorage[dateKey].forEach(memo => {
                if (memo.text.toLowerCase().includes(searchQuery)) {
                    matchCount++;
                    renderMemoItem(memo, dateKey); // 日付情報付きで出力
                }
            });
        });
        
        searchResultsCount.innerText = `該当するメモ: ${matchCount} 件`;
        if (matchCount === 0) {
            memoOutput.innerHTML = `<div class="text-center py-8 text-slate-500 text-xs italic">検索キーワードに一致するメモはありません。</div>`;
        }
    } else {
        // 通常モード（特定の日付のメモ一覧）
        searchResultsCount.classList.add('hidden');
        const dateObj = new Date(selectedDateStr);
        selectedDateLabel.innerText = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${weekdays[dateObj.getDay()]})`;
        
        const dayMemos = memoStorage[selectedDateStr] || [];
        if (dayMemos.length === 0) {
            memoOutput.innerHTML = `<div class="text-center py-8 text-slate-500 text-xs italic flex flex-col items-center gap-2"><i class="fa-regular fa-folder-open text-xl text-slate-600"></i>この日のメモはまだありません。</div>`;
            return;
        }
        
        dayMemos.forEach(memo => renderMemoItem(memo, selectedDateStr));
    }
}

// タイムラインアイテムのHTML生成
function renderMemoItem(memo, dateStr) {
    const memoItem = document.createElement('div');
    const cfg = tagConfig[memo.tag || 'study'];
    
    // 検索モードなら日付バッジを追加表示
    const dateBadge = searchQuery !== "" ? `<span class="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">${dateStr}</span>` : "";

    memoItem.className = 'group bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 flex justify-between items-start gap-4 hover:border-slate-600 transition-all duration-150';
    memoItem.innerHTML = `
        <div class="flex-1">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="${cfg.bg} ${cfg.text} ${cfg.border} border text-[10px] font-bold px-2 py-0.5 rounded-full">${cfg.label}</span>
                <span class="text-[11px] font-bold text-slate-500"><i class="fa-regular fa-clock"></i> ${memo.time}</span>
                ${dateBadge}
            </div>
            <div class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">${escapeHTML(memo.text)}</div>
        </div>
        <button class="delete-btn text-slate-600 hover:text-rose-400 p-1 rounded transition-all opacity-0 group-hover:opacity-100" data-id="${memo.id}" data-date="${dateStr}">
            <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
    `;

    memoItem.querySelector('.delete-btn').addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const dStr = e.currentTarget.getAttribute('data-date');
        deleteMemo(dStr, id);
    });

    memoOutput.appendChild(memoItem);
}

function saveMemo() {
    const text = memoInput.value.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!memoStorage[selectedDateStr]) memoStorage[selectedDateStr] = [];
    
    memoStorage[selectedDateStr].push({
        id: Math.random().toString(36).substring(2, 9),
        time: timeStr,
        tag: currentSelectedTag, // 選択中タグをバインド
        text: text
    });

    localStorage.setItem('ultimate_memo_app', JSON.stringify(memoStorage));
    
    memoInput.value = '';
    updateCharCount(); // カウンタのリセット
    renderCalendar();
    updateMemoDisplay();
}

function deleteMemo(dateStr, id) {
    if (!memoStorage[dateStr]) return;
    memoStorage[dateStr] = memoStorage[dateStr].filter(m => m.id !== id);
    if (memoStorage[dateStr].length === 0) delete memoStorage[dateStr];
    
    localStorage.setItem('ultimate_memo_app', JSON.stringify(memoStorage));
    renderCalendar();
    updateMemoDisplay();
}

// バックアップエクスポート
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memoStorage, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `ultimate_memo_backup_${formatDate(new Date())}.json`);
    a.click();
}

// バックアップから復元（インポート機能）
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            // 簡易フォーマットバリデーション
            if (typeof parsedData === 'object' && parsedData !== null) {
                if (confirm('既存のデータに上書きしてバックアップを復元しますか？')) {
                    memoStorage = parsedData;
                    localStorage.setItem('ultimate_memo_app', JSON.stringify(memoStorage));
                    renderCalendar();
                    updateMemoDisplay();
                    alert('データの復元に成功しました！');
                }
            } else {
                alert('無効なファイル形式です。');
            }
        } catch (err) {
            alert('ファイルの解析に失敗しました。正しいJSONファイルを選択してください。');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('すべてのデータがブラウザから完全に消去されます。本当に実行しますか？')) {
        memoStorage = {};
        localStorage.setItem('ultimate_memo_app', JSON.stringify(memoStorage));
        renderCalendar();
        updateMemoDisplay();
    }
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

init();
