// projects.js
// Gestionează proiectele pentru utilizatorul curent (localStorage)
(function(){
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) { window.location.href = 'login.html'; return; }

    // extrage username
    let username = '';
    try {
        const p = JSON.parse(loggedInUser);
        username = p.username || p.user || p.name || String(p);
    } catch (e) {
        username = String(loggedInUser);
    }
    username = String(username).trim() || 'utilizator';

    // determinăm planul utilizatorului (default: free)
    let plan = 'free';
    try { const parsed = JSON.parse(loggedInUser); plan = parsed.plan || parsed.type || parsed.role || plan; } catch(e){}
    plan = String(plan).trim().toLowerCase() || 'free';

    const PLANS = { free: { maxProjects: 2, maxTasks: 5 }, pro: { maxProjects: 10, maxTasks: 50 } };
    const limits = PLANS[plan] || PLANS.free;

    const projectsKey = `projects_${username}`;

    const STATUS_VALUES = ['Planned','Active','Completed'];

    // Permission check helper (for team-based permissions)
    // Currently projects are user-specific, but this structure allows future team integration
    function checkPermission(projectIndex, action) {
        // If TeamsManager is available, check team permissions
        if (window.TeamsManager) {
            // For now, projects are user-specific, so allow all actions
            // In future: check if project belongs to a team and verify permissions
            // const project = loadProjects()[projectIndex];
            // if (project && project.teamId) {
            //     return window.TeamsManager.hasPermission(project.teamId, action);
            // }
        }
        // Default: allow action (backward compatibility)
        return true;
    }

    function loadProjects(){
        try { const raw = localStorage.getItem(projectsKey); return raw ? JSON.parse(raw) : []; }
        catch(e){ return []; }
    }
    function saveProjects(arr){ localStorage.setItem(projectsKey, JSON.stringify(arr)); }

    const tableBody = document.getElementById('projects-table-body');
    const createBtn = document.getElementById('create-project-btn');

    function escapeHtml(str){ return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function render(){
        const projects = loadProjects();
        tableBody.innerHTML = '';

        // meta (count / max)
        const metaEl = document.getElementById('projects-meta');
        if (metaEl) metaEl.textContent = `Projects: ${projects.length} / ${limits.maxProjects} — Plan: ${plan.toUpperCase()}`;

        // marchează butonul ca la limita planului (nu îl dezactivăm cu disabled ca să poată fi click-uit pentru modal)
        if (createBtn) {
            if (projects.length >= limits.maxProjects) {
                // asigurăm că nu există atributul disabled (pentru a permite click)
                createBtn.removeAttribute('disabled');
                createBtn.classList.add('at-limit');
                createBtn.setAttribute('aria-disabled','true');
                createBtn.title = `You have reached the project limit for the ${plan.toUpperCase()} plan — click for options.`;
            } else {
                createBtn.classList.remove('at-limit');
                createBtn.removeAttribute('aria-disabled');
                createBtn.title = '';
            }
        }

        // afișează avertisment dacă numărul curent depășește limita (situații deja existente)
        if (metaEl && projects.length > limits.maxProjects) {
            metaEl.textContent += ' ⚠️ You\'ve exceeded your plan limit — remove projects or upgrade.';
        }

        if (!projects.length){
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6">No projects yet. Press <strong>Create project</strong> to add one.</td>`;
            tableBody.appendChild(row);
            return;
        }
        projects.forEach((p, idx) => {
            const row = document.createElement('tr');
            row.setAttribute('data-idx', String(idx));
            const statusClass = (p.status||'').toLowerCase();
            // compute progress
            let progress = 0;
            if (Array.isArray(p.tasks) && p.tasks.length){
                const done = p.tasks.filter(t => t && t.done).length;
                progress = Math.round((done / p.tasks.length) * 100);
            }
            row.innerHTML = `
                <td class="py-3 px-4"><a class="project-link" href="project.html?project=${idx}">${escapeHtml(p.name)}</a></td>
                <td class="py-3 px-4">${escapeHtml(p.description || '')}</td>
                <td class="py-3 px-4"><span class="status-badge ${statusClass}">${escapeHtml(p.status || '')}</span></td>
                <td class="py-3 px-4"><div class="progress" title="${progress}%"><div class="progress-inner" style="width:${progress}%"></div><span class="progress-text">${progress}%</span></div></td>
                <td class="py-3 px-4">You</td>
                <td class="py-3 px-4">
                    <button class="btn small" data-action="edit" data-idx="${idx}">Edit</button>
                    <button class="btn small" data-action="delete" data-idx="${idx}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Deschide dialog de creare proiect (site modal) sau afișează modalul de limită dacă s-a atins maxima
    const createModal = document.getElementById('create-project-modal');
    const createName = document.getElementById('create-name');
    const createDesc = document.getElementById('create-desc');
    const createStatus = document.getElementById('create-status');
    const createError = document.getElementById('create-error');
    const createCancel = document.getElementById('create-cancel');
    const createSave = document.getElementById('create-save');

    function showCreateModal(){
        const projects = loadProjects();
        if (projects.length >= limits.maxProjects){
            showLimitModal(projects.length, limits.maxProjects, plan);
            return;
        }
        if (!createModal) return;
        createName.value = '';
        createDesc.value = '';
        // populate status options
        createStatus.innerHTML = '';
        STATUS_VALUES.forEach(s => {
            const opt = document.createElement('option'); opt.value = s; opt.textContent = s; createStatus.appendChild(opt);
        });
        createStatus.value = STATUS_VALUES[0];
        createError.textContent = '';
        createModal.setAttribute('aria-hidden','false');
        createName.focus();
    }
    function closeCreateModal(){ if (!createModal) return; createModal.setAttribute('aria-hidden','true'); }

    if (createBtn) createBtn.addEventListener('click', (e) => { e.preventDefault(); showCreateModal(); });
    if (createCancel) createCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeCreateModal(); });
    const createOverlay = createModal ? createModal.querySelector('.modal-overlay') : null;
    if (createOverlay) createOverlay.addEventListener('click', (e)=>{ closeCreateModal(); });

    if (createSave) createSave.addEventListener('click', (e)=>{
        const name = (createName.value || '').trim();
        const desc = (createDesc.value || '').trim();
        const st = createStatus.value;
        const projects = loadProjects();
        if (!name){ createError.textContent = 'Project name cannot be empty.'; createName.focus(); return; }
        if (!STATUS_VALUES.includes(st)){ createError.textContent = 'Invalid status.'; return; }
        if (projects.length >= limits.maxProjects){ closeCreateModal(); showLimitModal(projects.length, limits.maxProjects, plan); return; }
        // Check permission to create (for team-based projects)
        if (!checkPermission(null, 'create')) {
            createError.textContent = 'You do not have permission to create projects.';
            return;
        }
        projects.push({ name: name, description: desc, status: st, tasks: [] });
        saveProjects(projects);
        closeCreateModal();
        render();
    });

    // escape pentru create/edit modals
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (createModal && createModal.getAttribute('aria-hidden') === 'false'){ closeCreateModal(); } } });

    // Modal: show/hide + handlers
    const limitModal = document.getElementById('limit-modal');
    const limitMsg = document.getElementById('limit-modal-msg');
    const limitCancel = document.getElementById('limit-cancel');
    const limitUpgrade = document.getElementById('limit-upgrade');

    // Edit modal elements
    const editModal = document.getElementById('edit-project-modal');
    const editName = document.getElementById('edit-name');
    const editDesc = document.getElementById('edit-desc');
    const editStatus = document.getElementById('edit-status');
    const editError = document.getElementById('edit-error');
    const editCancel = document.getElementById('edit-cancel');
    const editSave = document.getElementById('edit-save');

    function showLimitModal(current, max, planName){
        if (!limitModal) return;
        limitMsg.textContent = `You have reached the plan limit ${String(planName).toUpperCase()}: ${current} / ${max} projects. Upgrade for more.`;
        limitModal.setAttribute('aria-hidden','false');
        // focus gestion
        limitCancel.focus();
    }
    function hideLimitModal(){ if (!limitModal) return; limitModal.setAttribute('aria-hidden','true'); }

    let _editingIndex = null;
    function openEditModal(idx){
        if (!editModal) return;
        const projects = loadProjects();
        const p = projects[idx];
        if (!p) return;
        _editingIndex = idx;
        editName.value = p.name || '';
        editDesc.value = p.description || '';
        // ensure status select contains all allowed values and select current
        editStatus.innerHTML = '';
        STATUS_VALUES.forEach(s => {
            const opt = document.createElement('option'); opt.value = s; opt.textContent = s; editStatus.appendChild(opt);
        });
        if (!STATUS_VALUES.includes(p.status)){
            const extra = document.createElement('option'); extra.value = p.status; extra.textContent = p.status; editStatus.appendChild(extra);
        }
        editStatus.value = p.status || STATUS_VALUES[0];
        editError.textContent = '';
        editModal.setAttribute('aria-hidden','false');
        editName.focus();
    }
    function closeEditModal(){
        if (!editModal) return; editModal.setAttribute('aria-hidden','true'); _editingIndex = null;
    }
    if (editCancel) editCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeEditModal(); });
    const editOverlay = editModal ? editModal.querySelector('.modal-overlay') : null;
    if (editOverlay) editOverlay.addEventListener('click', (e)=>{ closeEditModal(); });
    editSave.addEventListener('click', (e)=>{
        if (_editingIndex === null) return;
        const projects = loadProjects();
        const p = projects[_editingIndex];
        if (!p) return;
        // Check permission to edit
        if (!checkPermission(_editingIndex, 'edit')) {
            editError.textContent = 'You do not have permission to edit this project.';
            return;
        }
        const nm = editName.value.trim();
        const ds = editDesc.value.trim();
        const st = editStatus.value;
        if (!nm) { editError.textContent = 'Project name cannot be empty.'; return; }
        if (!STATUS_VALUES.includes(st)) { editError.textContent = 'Status invalid.'; return; }
        projects[_editingIndex] = Object.assign({}, p, { name: nm, description: ds, status: st });
        saveProjects(projects);
        closeEditModal();
        render();
    });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ if (editModal && editModal.getAttribute('aria-hidden') === 'false'){ closeEditModal(); } } });

    // expose openEditModal to other handlers
    function showEditModal(idx){ openEditModal(idx); }

    // click pe overlay sau Anulează închide modalul
    const modalOverlay = limitModal ? limitModal.querySelector('.modal-overlay') : null;
    if (modalOverlay){ modalOverlay.addEventListener('click', hideLimitModal); }
    if (limitCancel) limitCancel.addEventListener('click', hideLimitModal);
    // Upgrade momentan nu face nimic (vizibil doar)
    // (nu adăugăm handler pentru limitUpgrade pentru a respecta cerința)

    // inchidere cu Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideLimitModal(); });

    // delegare pentru edit/delete și click pe rând
    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('button[data-action="edit"]');
        if (editBtn) {
            const idx = Number(editBtn.getAttribute('data-idx'));
            if (Number.isNaN(idx)) return;
            showEditModal(idx);
            return;
        }
        const btn = e.target.closest('button[data-action="delete"]');
        if (btn) {
            const idx = Number(btn.getAttribute('data-idx'));
            if (Number.isNaN(idx)) return;
            // Check permission to delete
            if (!checkPermission(idx, 'delete')) {
                alert('You do not have permission to delete this project.');
                return;
            }
            const projects = loadProjects();
            projects.splice(idx, 1);
            saveProjects(projects);
            render();
            return;
        }
        // click pe rând (dacă nu s-a dat click pe buton sau link) => deschide proiect
        const row = e.target.closest('tr[data-idx]');
        if (row && !e.target.closest('button') && !e.target.closest('a')) {
            const idx = Number(row.getAttribute('data-idx'));
            if (!Number.isNaN(idx)) window.location.href = `project.html?project=${idx}`;
        }
    });


    // ascunde link self din navbar
    try{
        const current = window.location.pathname.split('/').pop();
        if (current === 'projects.html'){
            const prAnchor = document.querySelector('.navbar a[href="projects.html"]');
            if (prAnchor){
                const li = prAnchor.closest('li'); if (li) li.style.display = 'none'; else prAnchor.style.display = 'none';
            }
        }
    } catch(e){ /* ignore */ }

    // Logout handler (previne '#' în URL și redirecționează la pagina de login)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    render();
})();