document.addEventListener('DOMContentLoaded', () => {
    initCalendar();

    // Overview page
    if (document.getElementById('profRingFill')) {
        updateProfessionUI(initialProfStats.target, initialProfStats.completed);
        initLeetCodeChart();
        updateTaskKPIs();
        updateNotebookBadges();
        updateCombinedScore();
    }

    // Physical page
    if (typeof currentWater !== 'undefined') {
        const wt = parseFloat(document.getElementById('waterTarget')?.textContent) || 2.5;
        updateWaterUI(currentWater, wt);
    }
});

// ─── Toast Notification System ───────────────────────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed; top: 24px; right: 24px; z-index: 9999;
            display: flex; flex-direction: column; gap: 10px; pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const icons = {
        success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`,
        error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };

    const colors = {
        success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', icon: '#10b981' },
        error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '#ef4444' },
        info: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)', icon: '#00d4ff' },
    };

    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex; align-items: center; gap: 12px;
        padding: 13px 18px;
        background: #111;
        border: 1px solid ${c.border};
        border-left: 3px solid ${c.icon};
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        min-width: 280px; max-width: 360px;
        pointer-events: all;
        transform: translateX(120%);
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
        opacity: 0;
        font-family: var(--font-main, Inter, sans-serif);
    `;
    toast.innerHTML = `
        <span style="color:${c.icon}; flex-shrink:0;">${icons[type] || icons.info}</span>
        <span style="font-size:0.84rem; color:#ccc; flex:1; line-height:1.5;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#555;cursor:pointer;font-size:1rem;padding:0 2px;flex-shrink:0;">✕</button>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// ─── Calendar ───────────────────────────────────────────────────────────────
let selectedDate = new Date().toISOString().split('T')[0];

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().split('T')[0];

    const monthEl = document.getElementById('currentMonthYear');
    if (monthEl) monthEl.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    calendarEl.innerHTML = '';

    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
        const el = document.createElement('div');
        el.textContent = d;
        el.className = 'cal-day-header';
        calendarEl.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) calendarEl.appendChild(document.createElement('div'));

    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.textContent = i;
        dayEl.classList.add('calendar-day');
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (dateStr === todayStr) dayEl.classList.add('today');
        if (dateStr === selectedDate) dayEl.classList.add('active');
        dayEl.onclick = () => selectDate(dateStr, dayEl);
        calendarEl.appendChild(dayEl);
    }
}

function selectDate(date, el) {
    selectedDate = date;
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    const disp = document.getElementById('selectedDateDisplay');
    if (disp) disp.textContent = date;
    fetchTasksForDate(date);
}

async function fetchTasksForDate(date) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    taskList.innerHTML = `<li style="padding:10px; color:var(--text-muted); font-size:0.83rem; text-align:center;">Retrieving tasks…</li>`;

    try {
        const res = await fetch(`/api/tasks?date=${date}`);
        const tasks = await res.json();
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `<li class="task-empty">No tasks scheduled for ${date}.</li>`;
            return;
        }
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = `task-item ${t.is_completed ? 'done' : ''}`;
            li.setAttribute('data-id', t.id);
            li.onclick = () => toggleTask(t.id, li);
            li.innerHTML = `
                <div class="task-checkbox">${t.is_completed ? checkSVG() : ''}</div>
                <span class="task-text ${t.is_completed ? 'completed' : ''}">${t.title}</span>`;
            taskList.appendChild(li);
        });
        updateTaskKPIs();
        updateCombinedScore();
    } catch (e) {
        taskList.innerHTML = `<li class="task-empty">Unable to load tasks. Check your connection.</li>`;
    }
}

const checkSVG = () => `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// ─── Daily Tasks ──────────────────────────────────────────────────────────────
async function addTask() {
    const input = document.getElementById('newTaskInput');
    const title = input.value.trim();
    if (!title) return;

    const res = await fetch('/api/task/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date: selectedDate })
    });
    if (res.ok) {
        const list = document.getElementById('taskList');
        const empty = list.querySelector('.task-empty');
        if (empty) empty.remove();
        const li = document.createElement('li');
        li.className = 'task-item';
        li.onclick = () => toggleTask(null, li);
        li.innerHTML = `<div class="task-checkbox"></div><span class="task-text">${title}</span>`;
        list.appendChild(li);
        input.value = '';
        updateTaskKPIs();
        updateCombinedScore();
    }
}

async function toggleTask(id, li) {
    const textEl = li.querySelector('.task-text');
    const checkEl = li.querySelector('.task-checkbox');
    const isNowDone = !li.classList.contains('done');

    li.classList.toggle('done', isNowDone);
    if (textEl) textEl.classList.toggle('completed', isNowDone);
    if (checkEl) checkEl.innerHTML = isNowDone ? checkSVG() : '';

    updateTaskKPIs();
    updateCombinedScore();

    if (id) {
        await fetch('/api/task/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: isNowDone })
        });
    }
}

function updateTaskKPIs() {
    const items = document.querySelectorAll('#taskList .task-item');
    const done = document.querySelectorAll('#taskList .task-item.done').length;
    const total = items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const kpiDone = document.getElementById('kpiTasksDone');
    const kpiTotal = document.getElementById('kpiTasksTotal');
    const kpiPct = document.getElementById('kpiTasksPct');

    if (kpiDone) kpiDone.textContent = done;
    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPct) kpiPct.textContent = `${pct}% complete`;
}

// ─── Notes ───────────────────────────────────────────────────────────────────
async function saveNotes() {
    const notes = document.getElementById('techNotes')?.value;
    const status = document.getElementById('noteStatus');
    if (!notes && notes !== '') return;
    if (status) status.textContent = 'Saving…';

    await fetch('/api/profession/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
    });

    if (status) {
        status.textContent = 'Saved ✓';
        setTimeout(() => status.textContent = 'Auto-saves on blur', 2000);
    }
}

// ─── Profession Ring ──────────────────────────────────────────────────────────
function updateProfessionUI(target, completed) {
    target = parseInt(target) || 0;
    completed = parseInt(completed) || 0;

    const pct = target > 0 ? Math.min((completed / target) * 100, 100) : 0;
    const pctRound = Math.round(pct);
    const circumference = 226.2; // 2 * π * 36

    const ring = document.getElementById('profRingFill');
    if (ring) {
        // Enforce the SVG property dynamically here to prevent bugs
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
    }

    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('profPercentage', pctRound + '%');
    setText('kpiProfPct', pctRound + '%');
    setText('profBarPct', pctRound + '%');
    setText('profCompletedDisplay', completed);
    setText('profTargetDisplay', target);

    const bar = document.getElementById('profProgressBar');
    if (bar) bar.style.width = pct + '%';

    return pct;
}

// ─── Profession Notebook ──────────────────────────────────────────────────────
let currentTab = 'todo';

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('profTodoList').style.display = tab === 'todo' ? '' : 'none';
    document.getElementById('profDoneList').style.display = tab === 'done' ? '' : 'none';
    document.getElementById('tabTodo').classList.toggle('active', tab === 'todo');
    document.getElementById('tabDone').classList.toggle('active', tab === 'done');
}

function updateNotebookBadges() {
    const todoItems = document.querySelectorAll('#profTodoList .prof-task-item').length;
    const doneItems = document.querySelectorAll('#profDoneList .prof-task-item').length;

    const badgeTodo = document.getElementById('badgeTodo');
    const badgeDone = document.getElementById('badgeDone');
    const kpiTotal = document.getElementById('kpiProfTotal');
    const kpiSub = document.getElementById('kpiProfDoneSub');

    if (badgeTodo) badgeTodo.textContent = todoItems;
    if (badgeDone) badgeDone.textContent = doneItems;
    if (kpiTotal) kpiTotal.textContent = todoItems + doneItems;
    if (kpiSub) kpiSub.textContent = `${doneItems} completed`;
}

async function addProfTask() {
    const input = document.getElementById('newProfTaskInput');
    const title = input.value.trim();
    if (!title) return;

    const res = await fetch('/api/profession/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    if (res.ok) {
        const data = await res.json();
        const todoList = document.getElementById('profTodoList');
        const emptyMsg = document.getElementById('todoEmptyMsg');
        if (emptyMsg) emptyMsg.remove();

        const li = document.createElement('li');
        li.className = 'prof-task-item';
        li.setAttribute('data-id', data.id);
        li.innerHTML = `
            <div class="ptask-check" onclick="toggleProfTask(${data.id}, this)"></div>
            <span class="ptask-text" contenteditable="true"
                  onblur="editProfTask(${data.id}, this)"
                  onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}">${title}</span>
            <button class="ptask-del" onclick="deleteProfTask(${data.id}, this.closest('li'))" title="Remove">✕</button>
        `;
        todoList.prepend(li);
        input.value = '';
        updateNotebookBadges();
        updateCombinedScore();

        // If "done" tab is shown, switch to todo to see new item
        if (currentTab === 'done') switchTab('todo');
    }
}

async function toggleProfTask(id, checkEl) {
    const li = checkEl.closest('li') || checkEl.closest('.prof-task-item');
    const isDone = !checkEl.classList.contains('checked');

    const res = await fetch('/api/profession/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: isDone })
    });

    if (res.ok) {
        const data = await res.json();
        const textEl = li.querySelector('.ptask-text');

        if (isDone) {
            // Move to done list
            checkEl.classList.add('checked');
            checkEl.innerHTML = checkSVG();
            li.classList.add('done');
            if (textEl) {
                textEl.classList.add('done-text');
                textEl.contentEditable = 'false';
            }

            const doneList = document.getElementById('profDoneList');
            const doneEmpty = document.getElementById('doneEmptyMsg');
            if (doneEmpty) doneEmpty.remove();
            doneList.prepend(li);

            // If todo is now empty
            const todoList = document.getElementById('profTodoList');
            if (!todoList.querySelector('.prof-task-item')) {
                const emptyLi = document.createElement('li');
                emptyLi.id = 'todoEmptyMsg';
                emptyLi.className = 'task-empty';
                emptyLi.textContent = 'Your profession task list is clear. Add a task above.';
                todoList.appendChild(emptyLi);
            }
        } else {
            // Move back to todo
            checkEl.classList.remove('checked');
            checkEl.innerHTML = '';
            li.classList.remove('done');
            if (textEl) {
                textEl.classList.remove('done-text');
                textEl.contentEditable = 'true';
            }

            const todoList = document.getElementById('profTodoList');
            const todoEmpty = document.getElementById('todoEmptyMsg');
            if (todoEmpty) todoEmpty.remove();
            todoList.prepend(li);

            const doneList = document.getElementById('profDoneList');
            if (!doneList.querySelector('.prof-task-item')) {
                const emptyLi = document.createElement('li');
                emptyLi.id = 'doneEmptyMsg';
                emptyLi.className = 'task-empty';
                emptyLi.textContent = 'No completed tasks yet. Keep going!';
                doneList.appendChild(emptyLi);
            }
        }

        // Update profession ring with live counts
        updateProfessionUI(data.total, data.done);
        updateNotebookBadges();
        updateCombinedScore();
    }
}

async function editProfTask(id, el) {
    const newTitle = el.textContent.trim();
    if (!newTitle) {
        showToast('Task title cannot be empty.', 'error');
        return;
    }
    await fetch('/api/profession/tasks/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: newTitle })
    });
}

async function deleteProfTask(id, li) {
    if (!li) return;
    const res = await fetch('/api/profession/tasks/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    if (res.ok) {
        li.style.opacity = '0';
        li.style.transform = 'translateX(20px)';
        li.style.transition = 'all 0.25s ease';
        setTimeout(() => {
            li.remove();
            updateNotebookBadges();
        }, 250);
    }
}

// ─── Combined Score ──────────────────────────────────────────────────────────
function updateCombinedScore() {
    const taskItems = document.querySelectorAll('#taskList .task-item');
    const taskDone = document.querySelectorAll('#taskList .task-item.done').length;
    const physPct = taskItems.length > 0 ? Math.round((taskDone / taskItems.length) * 100) : 0;

    const profComplete = parseInt(document.getElementById('profCompletedDisplay')?.textContent || initialProfStats.completed);
    const profTarget = parseInt(document.getElementById('profTargetDisplay')?.textContent || initialProfStats.target);
    const profPct = profTarget > 0 ? Math.min(Math.round((profComplete / profTarget) * 100), 100) : 0;

    const combined = Math.round((physPct + profPct) / 2);

    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('combinedScoreVal', combined + '%');
    setText('physScorePart', physPct + '%');
    setText('profScorePart', profPct + '%');
}

// ─── Chart ───────────────────────────────────────────────────────────────────
function initLeetCodeChart() {
    const canvas = document.getElementById('leetcodeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    window.leetcodeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Tasks', 'Completed'],
            datasets: [{
                data: [initialProfStats.target, initialProfStats.completed],
                backgroundColor: ['rgba(0,212,255,0.12)', 'rgba(124,58,237,0.35)'],
                borderColor: ['rgba(0,212,255,0.5)', 'rgba(124,58,237,0.7)'],
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 700, easing: 'easeInOutQuart' },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#555', font: { size: 11 } },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#777', font: { size: 11 } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#888',
                    padding: 12
                }
            }
        }
    });
}

// ─── Physical — Hydration ────────────────────────────────────────────────────
let waterIntake = 0;

function updateWaterUI(amount, target) {
    waterIntake = amount;
    if (!target) target = parseFloat(document.getElementById('waterTarget')?.textContent) || 2.5;
    const pct = Math.min((waterIntake / target) * 100, 100);

    const bar = document.getElementById('waterBar');
    const level = document.getElementById('waterLevelText') || document.getElementById('waterLevel');
    if (bar) bar.style.width = pct + '%';
    if (level) level.textContent = waterIntake.toFixed(2) + ' L';
}

async function addWater(amount) {
    waterIntake += amount;
    if (waterIntake < 0) waterIntake = 0;
    const target = parseFloat(document.getElementById('waterTarget')?.textContent) || 2.5;
    updateWaterUI(waterIntake, target);

    await fetch('/api/physical/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ water: parseFloat(waterIntake.toFixed(2)) })
    });
}

async function saveFood() {
    const foodLog = document.getElementById('foodLog');
    if (!foodLog) return;
    await fetch('/api/physical/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_log: foodLog.value })
    });
}

// ─── Nutrition Checklist ─────────────────────────────────────────────────────
async function toggleNutrition(id, li) {
    const check = li.querySelector('.nutri-check');
    const text = li.querySelector('.nutri-text');
    const isChecked = !li.classList.contains('checked');

    li.classList.toggle('checked', isChecked);
    if (check) {
        check.classList.toggle('checked', isChecked);
        check.innerHTML = isChecked
            ? `<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="#000" stroke-width="1.8" stroke-linecap="round"/></svg>`
            : '';
    }
    if (text) text.classList.toggle('done-text', isChecked);

    await fetch('/api/nutrition/checklist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, checked: isChecked })
    });
}
// ─── Browser Notifications ──────────────────────────────────────────────────
function initBrowserNotifications() {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Schedule daily notification at start of day (midnight)
    scheduleDailyNotification();
}

function scheduleDailyNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return; // Notifications not supported or not permitted
    }

    // Check when the next midnight is and schedule notification
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow - now;

    // Set up interval to check every minute if it's midnight
    setInterval(() => {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();

        // Trigger notification at midnight (00:00)
        if (currentHour === 0 && currentMinute === 0) {
            showDailyNotification();
        }
    }, 60000); // Check every minute

    // Also trigger immediately if within first minute after page load
    const checkNow = () => {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        if (hour === 0 && minute === 0) {
            showDailyNotification();
        }
    };
    setTimeout(checkNow, 1000);
}

function showDailyNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Good Morning! ☀️', {
            body: 'Your new day has begun! Time to track your activities and set goals for today.',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300d4ff"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6" r="1.5"/><line x1="12" y1="9" x2="12" y2="15" stroke="white" stroke-width="1.5"/><line x1="8" y1="12" x2="16" y2="12" stroke="white" stroke-width="1.5"/></svg>',
            tag: 'daily-reminder',
            requireInteraction: false
        });
        showToast('New day started! Check your daily goals.', 'success');
    }
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', () => {
    initBrowserNotifications();
});