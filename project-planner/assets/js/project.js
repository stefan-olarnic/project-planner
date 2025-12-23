// project.js
// Pagina de detalii pentru un proiect: afișează detalii și task-uri, permite adăugare/ștergere task-uri
(function(){
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) { window.location.href = 'login.html'; return; }

    // extract username and plan
    let username = '', plan = 'free';
    try {
        const p = JSON.parse(loggedInUser);
        username = p.username || p.user || p.name || String(p);
        plan = p.plan || p.type || p.role || 'free';
    } catch(e){ username = String(loggedInUser); }
    username = String(username).trim() || 'user';
    plan = String(plan).trim().toLowerCase() || 'free';

    const PLANS = { free: { maxProjects: 2, maxTasks: 5 }, pro: { maxProjects: 10, maxTasks: 50 } };
    const limits = PLANS[plan] || PLANS.free;

    // Permission check helper (for team-based permissions)
    function checkPermission(action) {
        // If TeamsManager is available, check team permissions
        if (window.TeamsManager) {
            // For now, projects are user-specific, so allow all actions
            // In future: check if project belongs to a team and verify permissions
            // if (project && project.teamId) {
            //     return window.TeamsManager.hasPermission(project.teamId, action);
            // }
        }
        // Default: allow action (backward compatibility)
        return true;
    }

    // Project error modal helper — shows an in-app modal and optionally redirects after OK
    function showProjectError(msg, redirectUrl){
        const modal = document.getElementById('project-error-modal');
        const msgEl = document.getElementById('project-error-msg');
        const ok = document.getElementById('project-error-ok');
        if (!modal || !msgEl || !ok){ if (redirectUrl) window.location.href = redirectUrl; else return; }
        msgEl.textContent = msg;
        modal.setAttribute('aria-hidden','false');
        const cleanup = () => { modal.setAttribute('aria-hidden','true'); if (redirectUrl) window.location.href = redirectUrl; };
        const handler = (e) => { e && e.preventDefault(); cleanup(); };
        ok.addEventListener('click', handler, { once: true });
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) overlay.addEventListener('click', cleanup, { once: true });
        const onEsc = (e) => { if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', onEsc); } };
        document.addEventListener('keydown', onEsc);
    }

    const params = new URLSearchParams(window.location.search);
    const idx = Number(params.get('project'));
    if (Number.isNaN(idx)) { showProjectError('Project id invalid', 'projects.html'); return; }

    const projectsKey = `projects_${username}`;
    function loadProjects(){ try { const raw = localStorage.getItem(projectsKey); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
    function saveProjects(arr){ localStorage.setItem(projectsKey, JSON.stringify(arr)); }

    const projects = loadProjects();
    if (!projects[idx]) { showProjectError('Project does not exist', 'projects.html'); return; }

    const STATUS_VALUES = ['Planned','Active','Completed'];

    const project = projects[idx];
    // asigură structura tasks
    if (!Array.isArray(project.tasks)) project.tasks = [];

    const titleEl = document.getElementById('project-title');
    const descEl = document.getElementById('project-desc');
    const statusEl = document.getElementById('project-status');
    const tasksList = document.getElementById('tasks-list');
    const addTaskBtn = document.getElementById('add-task-btn');

    function calculateProgress(){
        if (!Array.isArray(project.tasks) || !project.tasks.length) return 0;
        const done = project.tasks.filter(x => x && x.done).length;
        return Math.round((done / project.tasks.length) * 100);
    }

    function renderProgress(){
        try{
            const pEl = document.getElementById('project-progress');
            if (!pEl) return;
            const percent = calculateProgress();
            const inner = pEl.querySelector('.progress-inner');
            const text = pEl.querySelector('.progress-text');
            if (inner) inner.style.width = percent + '%';
            if (text) text.textContent = percent + '%';
            const bar = pEl.querySelector('.progress'); if (bar) bar.setAttribute('aria-valuenow', String(percent));
        }catch(e){}
    }

    function renderTodayTasks(){
        const todayList = document.getElementById('today-tasks-list');
        if (!todayList) return;
        todayList.innerHTML = '';
        const today = new Date().toISOString().slice(0,10);
        const todays = project.tasks.filter(t => t && t.dueDate === today);
        if (!todays.length){
            const li = document.createElement('li'); li.textContent = 'No tasks scheduled for today.'; todayList.appendChild(li); return;
        }
        todays.forEach((t, i) => {
            const li = document.createElement('li');
            const idx = project.tasks.indexOf(t);
            li.innerHTML = `<label><input type="checkbox" class="task-done-checkbox" data-idx="${idx}" ${t.done ? 'checked' : ''} /> ${escapeHtml(t.title)}</label>`;
            todayList.appendChild(li);
        });
    }

    function renderTasks(){
        const countEl = document.getElementById('tasks-count'); if (countEl) countEl.textContent = String(project.tasks.length || 0);
        tasksList.innerHTML = '';
        if (!project.tasks.length){
            const li = document.createElement('li'); li.textContent = 'No tasks yet'; tasksList.appendChild(li); renderTodayTasks(); renderProgress(); return;
        }
        project.tasks.forEach((t, i) => {
            const li = document.createElement('li');
            const checked = t.done ? 'checked' : '';
            const due = t.dueDate ? `<div class="text-sm text-gray-500">Due: ${escapeHtml(t.dueDate)}</div>` : '';
            li.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <label><input type="checkbox" class="task-done-checkbox" data-idx="${i}" ${checked} /> <strong>${escapeHtml(t.title)}</strong></label>
                        ${due}
                        <div class="text-sm text-gray-600">${escapeHtml(t.note || '')}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn small" data-action="set-today" data-idx="${i}">Today</button>
                        <button class="btn small" data-action="set-date" data-idx="${i}">Set date</button>
                        <button class="btn small" data-action="delete" data-idx="${i}">Delete</button>
                    </div>
                </div>
            `;
            tasksList.appendChild(li);
        });
        renderTodayTasks();
        renderProgress();
    }

    function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    titleEl.textContent = project.name || 'Project';
    descEl.textContent = project.description || '';
    statusEl.innerHTML = `<span class="status-badge ${String(project.status||'').toLowerCase()}">${escapeHtml(project.status||'')}</span>`;

    // Add Task modal elements and handlers
    const addTaskModal = document.getElementById('add-task-modal');
    const addTaskTitleInput = document.getElementById('add-task-title-input');
    const addTaskNoteInput = document.getElementById('add-task-note-input');
    const addTaskDueInput = document.getElementById('add-task-due-input');
    const addTaskError = document.getElementById('add-task-error');
    const addTaskCancel = document.getElementById('add-task-cancel');
    const addTaskSave = document.getElementById('add-task-save');

    function showAddTaskModal(){
        if (project.tasks.length >= limits.maxTasks){
            showTaskLimitModal();
            return;
        }
        if (!addTaskModal) return;
        addTaskTitleInput.value = '';
        addTaskNoteInput.value = '';
        addTaskDueInput.value = '';
        addTaskError.textContent = '';
        addTaskModal.setAttribute('aria-hidden','false');
        addTaskTitleInput.focus();
    }
    function closeAddTaskModal(){ if (!addTaskModal) return; addTaskModal.setAttribute('aria-hidden','true'); }

    if (addTaskBtn) addTaskBtn.addEventListener('click', showAddTaskModal);
    if (addTaskCancel) addTaskCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeAddTaskModal(); });
    const addTaskOverlay = addTaskModal ? addTaskModal.querySelector('.modal-overlay') : null;
    if (addTaskOverlay) addTaskOverlay.addEventListener('click', (e)=>{ closeAddTaskModal(); });
    if (addTaskSave) addTaskSave.addEventListener('click', ()=>{
        const title = (addTaskTitleInput.value || '').trim();
        if (!title){ addTaskError.textContent = 'Task title cannot be empty.'; addTaskTitleInput.focus(); return; }
        // Check permission to create tasks
        if (!checkPermission('create')) {
            addTaskError.textContent = 'You do not have permission to create tasks.';
            return;
        }
        const note = (addTaskNoteInput.value || '').trim();
        const due = (addTaskDueInput.value || '').trim();
        const dueDate = due || '';
        project.tasks.push({ title, note, done: false, dueDate });
        projects[idx] = project; saveProjects(projects); closeAddTaskModal(); renderTasks();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (addTaskModal && addTaskModal.getAttribute('aria-hidden') === 'false'){ closeAddTaskModal(); } } });

    // Task Limit modal elements and handlers
    const taskLimitModal = document.getElementById('task-limit-modal');
    const taskLimitMsg = document.getElementById('task-limit-msg');
    const taskLimitClose = document.getElementById('task-limit-close');
    const taskLimitUpgrade = document.getElementById('task-limit-upgrade');

    function showTaskLimitModal(){
        if (!taskLimitModal) return;
        if (taskLimitMsg) taskLimitMsg.textContent = `You have reached the maximum number of tasks (${limits.maxTasks}) for the ${plan.toUpperCase()} plan.`;
        // hide upgrade option for Pro users
        if (String(plan).toLowerCase() === 'pro'){
            if (taskLimitUpgrade) taskLimitUpgrade.style.display = 'none';
        } else {
            if (taskLimitUpgrade) taskLimitUpgrade.style.display = '';
        }
        taskLimitModal.setAttribute('aria-hidden','false');
        if (taskLimitClose) taskLimitClose.focus();
    }
    function closeTaskLimitModal(){ if (!taskLimitModal) return; taskLimitModal.setAttribute('aria-hidden','true'); }
    if (taskLimitClose) taskLimitClose.addEventListener('click', (e)=>{ e.preventDefault(); closeTaskLimitModal(); });
    const taskLimitOverlay = taskLimitModal ? taskLimitModal.querySelector('.modal-overlay') : null; if (taskLimitOverlay) taskLimitOverlay.addEventListener('click', (e)=>{ closeTaskLimitModal(); });
    if (taskLimitUpgrade) taskLimitUpgrade.addEventListener('click', (e)=>{ e.preventDefault(); closeTaskLimitModal(); /* global upgrade modal will open due to data-upgrade attribute */ });

    // close Task Limit modal with Escape
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (taskLimitModal && taskLimitModal.getAttribute('aria-hidden') === 'false'){ closeTaskLimitModal(); } } });

    // Edit project using modal
    const editBtn = document.getElementById('edit-project-btn');
    const projectEditModal = document.getElementById('edit-project-modal');
    const projectEditName = document.getElementById('project-edit-name');
    const projectEditDesc = document.getElementById('project-edit-desc');
    const projectEditStatus = document.getElementById('project-edit-status');
    const projectEditError = document.getElementById('project-edit-error');
    const projectEditCancel = document.getElementById('project-edit-cancel');
    const projectEditSave = document.getElementById('project-edit-save');

    function showProjectEditModal(){
        if (!projectEditModal) return;
        projectEditName.value = project.name || '';
        projectEditDesc.value = project.description || '';
        projectEditStatus.innerHTML = '';
        STATUS_VALUES.forEach(s => { const opt = document.createElement('option'); opt.value = s; opt.textContent = s; projectEditStatus.appendChild(opt); });
        if (!STATUS_VALUES.includes(project.status)) { const extra = document.createElement('option'); extra.value = project.status; extra.textContent = project.status; projectEditStatus.appendChild(extra); }
        projectEditStatus.value = project.status || STATUS_VALUES[0];
        projectEditError.textContent = '';
        projectEditModal.setAttribute('aria-hidden','false');
        projectEditName.focus();
    }
    function closeProjectEditModal(){ if (!projectEditModal) return; projectEditModal.setAttribute('aria-hidden','true'); }

    if (editBtn) editBtn.addEventListener('click', showProjectEditModal);
    if (projectEditCancel) projectEditCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeProjectEditModal(); });
    const projectEditOverlay = projectEditModal ? projectEditModal.querySelector('.modal-overlay') : null;
    if (projectEditOverlay) projectEditOverlay.addEventListener('click', (e)=>{ closeProjectEditModal(); });
    if (projectEditSave) projectEditSave.addEventListener('click', ()=>{
        const nm = (projectEditName.value || '').trim();
        const ds = (projectEditDesc.value || '').trim();
        const st = projectEditStatus.value;
        if (!nm){ projectEditError.textContent = 'Project name cannot be empty.'; return; }
        if (!STATUS_VALUES.includes(st)){ projectEditError.textContent = 'Status invalid.'; return; }
        // Check permission to edit
        if (!checkPermission('edit')) {
            projectEditError.textContent = 'You do not have permission to edit this project.';
            return;
        }
        project.name = nm; project.description = ds; project.status = st;
        projects[idx] = project; saveProjects(projects);
        titleEl.textContent = project.name; descEl.textContent = project.description; statusEl.innerHTML = `<span class="status-badge ${String(project.status||'').toLowerCase()}">${escapeHtml(project.status||'')}</span>`;
        closeProjectEditModal();
    });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (projectEditModal && projectEditModal.getAttribute('aria-hidden') === 'false'){ closeProjectEditModal(); } } });

    // Delete project using modal confirmation
    const deleteBtn = document.getElementById('delete-project-btn');
    const deleteProjectModal = document.getElementById('delete-project-modal');
    const deleteProjectCancel = document.getElementById('delete-project-cancel');
    const deleteProjectConfirm = document.getElementById('delete-project-confirm');
    function showDeleteProjectModal(){ if (!deleteProjectModal) return; deleteProjectModal.setAttribute('aria-hidden','false'); deleteProjectCancel.focus(); }
    function closeDeleteProjectModal(){ if (!deleteProjectModal) return; deleteProjectModal.setAttribute('aria-hidden','true'); }
    if (deleteBtn) deleteBtn.addEventListener('click', (e)=>{ e.preventDefault(); showDeleteProjectModal(); });
    if (deleteProjectCancel) deleteProjectCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeDeleteProjectModal(); });
    const deleteOverlay = deleteProjectModal ? deleteProjectModal.querySelector('.modal-overlay') : null;
    if (deleteOverlay) deleteOverlay.addEventListener('click', (e)=>{ closeDeleteProjectModal(); });
    if (deleteProjectConfirm) deleteProjectConfirm.addEventListener('click', ()=>{
        // Check permission to delete
        if (!checkPermission('delete')) {
            alert('You do not have permission to delete this project.');
            closeDeleteProjectModal();
            return;
        }
        const all = loadProjects();
        all.splice(idx,1);
        saveProjects(all);
        window.location.href = 'projects.html';
    });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (deleteProjectModal && deleteProjectModal.getAttribute('aria-hidden') === 'false'){ closeDeleteProjectModal(); } } });

    // Set date modal for tasks
    const setDateModal = document.getElementById('set-date-modal');
    const setDateInput = document.getElementById('set-date-input');
    const setDateError = document.getElementById('set-date-error');
    const setDateCancel = document.getElementById('set-date-cancel');
    const setDateSave = document.getElementById('set-date-save');
    let _setDateIndex = null;
    function showSetDateModal(i){ if (!setDateModal) return; _setDateIndex = i; setDateError.textContent = ''; setDateInput.value = (project.tasks[i] && project.tasks[i].dueDate) || ''; setDateModal.setAttribute('aria-hidden','false'); setDateInput.focus(); }
    function closeSetDateModal(){ if (!setDateModal) return; setDateModal.setAttribute('aria-hidden','true'); _setDateIndex = null; }
    if (setDateCancel) setDateCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeSetDateModal(); });
    const setDateOverlay = setDateModal ? setDateModal.querySelector('.modal-overlay') : null; if (setDateOverlay) setDateOverlay.addEventListener('click', (e)=>{ closeSetDateModal(); });
    if (setDateSave) setDateSave.addEventListener('click', ()=>{ if (_setDateIndex === null) return; const s = (setDateInput.value || '').trim(); if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)){ setDateError.textContent = 'Invalid format. Use YYYY-MM-DD.'; return; } project.tasks[_setDateIndex].dueDate = s || ''; projects[idx]=project; saveProjects(projects); closeSetDateModal(); renderTasks(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (setDateModal && setDateModal.getAttribute('aria-hidden') === 'false'){ closeSetDateModal(); } } });

    // delegare pentru acțiuni task: delete / done toggle / set date / set today
    tasksList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('button[data-action="delete"]');
        if (deleteBtn) {
            const i = Number(deleteBtn.getAttribute('data-idx'));
            if (Number.isNaN(i)) return;
            // Check permission to delete tasks
            if (!checkPermission('delete')) {
                alert('You do not have permission to delete tasks.');
                return;
            }
            project.tasks.splice(i,1); projects[idx]=project; saveProjects(projects); renderTasks();
            return;
        }
        const setToday = e.target.closest('button[data-action="set-today"]');
        if (setToday) {
            const i = Number(setToday.getAttribute('data-idx'));
            if (Number.isNaN(i)) return;
            const today = new Date().toISOString().slice(0,10);
            project.tasks[i].dueDate = today;
            projects[idx]=project; saveProjects(projects); renderTasks();
            return;
        }
        const setDate = e.target.closest('button[data-action="set-date"]');
        if (setDate) {
            const i = Number(setDate.getAttribute('data-idx'));
            if (Number.isNaN(i)) return;
            showSetDateModal(i);
            return;
        }
        // checkbox toggle
        const cb = e.target.closest('input.task-done-checkbox');
        if (cb){
            const i = Number(cb.getAttribute('data-idx'));
            if (Number.isNaN(i)) return;
            // Check permission to edit (marking as done is editing)
            if (!checkPermission('edit')) {
                cb.checked = !cb.checked; // Revert checkbox
                alert('You do not have permission to mark tasks as completed.');
                return;
            }
            project.tasks[i].done = !!cb.checked;
            projects[idx]=project; saveProjects(projects); renderTasks();
            return;
        }
    });

    // ascunde link self din navbar
    try{
        const current = window.location.pathname.split('/').pop();
        if (current === 'project.html'){
            const prAnchor = document.querySelector('.navbar a[href="project.html"]');
            if (prAnchor){ const li = prAnchor.closest('li'); if (li) li.style.display='none'; else prAnchor.style.display='none'; }
        }
    } catch(e){ }

    // handle checkboxes in the today list (delegated)
    const todayListEl = document.getElementById('today-tasks-list');
    if (todayListEl){
        todayListEl.addEventListener('click', (e)=>{
            const cb = e.target.closest('input.task-done-checkbox');
            if (!cb) return; const i = Number(cb.getAttribute('data-idx')); if (Number.isNaN(i)) return;
            project.tasks[i].done = !!cb.checked; projects[idx]=project; saveProjects(projects); renderTasks();
        });
    }

    renderTasks();
})();