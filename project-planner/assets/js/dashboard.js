// dashboard.js

// 1. Verifică dacă utilizatorul e logat
const loggedInUser = localStorage.getItem("loggedInUser");
if (!loggedInUser) {
    window.location.href = "login.html"; // redirect la login dacă nu e logat
}

// 2. Afișează mesaj de bun venit
// Extrage doar username-ul (dacă `loggedInUser` e JSON) sau folosește valoarea directă
let displayName = '';
let userPlan = 'free';
try {
    const parsed = JSON.parse(loggedInUser);
    if (parsed && typeof parsed === 'object') {
        displayName = parsed.username || parsed.user || parsed.name || '';
        userPlan = parsed.plan || parsed.type || parsed.role || userPlan;
    } else {
        displayName = String(parsed);
    }
} catch (err) {
    // Nu e JSON, folosește valoarea directă
    displayName = loggedInUser;
}
userPlan = String(userPlan || 'free').trim().toLowerCase();
// Normalize and truncate display name (avoid revealing sensitive data)
displayName = String(displayName).trim();
if (!displayName) displayName = 'user';
/* Upgrade button handler is declared further below where page elements are managed */
const MAX_NAME_LEN = 20;
if (displayName.length > MAX_NAME_LEN) displayName = displayName.slice(0, MAX_NAME_LEN) + '…';
// Use textContent (not innerHTML) to avoid XSS
document.getElementById("welcome-msg").textContent = `Welcome, ${displayName}!`;

function markCurrentPlan(){
    try{
        const freeCard = document.getElementById('free-plan-card');
        const proCard = document.getElementById('pro-plan-card');
        [freeCard, proCard].forEach(c => { if (!c) return; const ex = c.querySelector('.current-plan-badge'); if (ex) ex.remove(); c.classList.remove('current-plan-card'); });
        if (userPlan === 'free' && freeCard){
            const b = document.createElement('span'); b.className = 'current-plan-badge'; b.textContent = 'Current plan';
            const placeholder = freeCard.querySelector('.plan-badge-placeholder'); if (placeholder) placeholder.appendChild(b);
            freeCard.classList.add('current-plan-card');
        }
        if (userPlan === 'pro' && proCard){
            const b = document.createElement('span'); b.className = 'current-plan-badge'; b.textContent = 'Current plan';
            const placeholder = proCard.querySelector('.plan-badge-placeholder'); if (placeholder) placeholder.appendChild(b);
            proCard.classList.add('current-plan-card');
        }
    }catch(e){/* no-op */}
}

// 3. Gestionează proiectele per-user (stocate în localStorage)
let rawUsername = '';
try {
    const parsed = JSON.parse(loggedInUser);
    if (parsed && typeof parsed === 'object') rawUsername = parsed.username || parsed.user || parsed.name || '';
    else rawUsername = String(parsed);
} catch (err) {
    rawUsername = String(loggedInUser);
}
rawUsername = String(rawUsername).trim() || 'utilizator';
const projectsKey = `projects_${rawUsername}`;

function loadProjects() {
    try {
        const raw = localStorage.getItem(projectsKey);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}
function saveProjects(arr) {
    localStorage.setItem(projectsKey, JSON.stringify(arr));
}

let projects = loadProjects();

const tableBody = document.getElementById("dashboard-table-body");

function escapeHtml(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

function renderProjects(limit = null) {
    tableBody.innerHTML = '';
    if (!projects.length) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4">No projects. Press <strong>Create project</strong> to add one.</td>`;
        tableBody.appendChild(row);
        return;
    }
    let shown = 0;
    for (let i = 0; i < projects.length; i++) {
        if (typeof limit === 'number' && shown >= limit) break;
        const p = projects[i];
        const row = document.createElement('tr');
        row.setAttribute('data-idx', String(i));
        const statusClass = (p.status||'').toLowerCase();
        // compute progress
        let progress = 0;
        if (Array.isArray(p.tasks) && p.tasks.length){
            const done = p.tasks.filter(t => t && t.done).length;
            progress = Math.round((done / p.tasks.length) * 100);
        }
        row.innerHTML = `
            <td class="py-3 px-4"><a class="project-link" href="project.html?project=${i}">${escapeHtml(p.name)}</a></td>
            <td class="py-3 px-4"><span class="status-badge ${statusClass}">${escapeHtml(p.status || '')}</span></td>
            <td class="py-3 px-4">${escapeHtml(p.deadline || '')}</td>
            <td class="py-3 px-4"><div class="progress" title="${progress}%">
                <div class="progress-inner" style="width:${progress}%"></div>
                <span class="progress-text">${progress}%</span>
            </div></td>
        `;
        tableBody.appendChild(row);
        shown++;
    }

    // make rows clickable (open project on row click, but ignore clicks on links or buttons)
    tableBody.removeEventListener && tableBody.removeEventListener('click', tableBody.__clickHandler);
    tableBody.__clickHandler = function(e){
        const row = e.target.closest && e.target.closest('tr[data-idx]');
        if (!row) return;
        if (e.target.closest('a') || e.target.closest('button')) return;
        const idx = Number(row.getAttribute('data-idx'));
        if (!Number.isNaN(idx)) window.location.href = `project.html?project=${idx}`;
    };
    tableBody.addEventListener('click', tableBody.__clickHandler);

}

// Render a plan-aware number of projects in preview (free:2, pro:10)
const PREVIEW_COUNTS = { free: 2, pro: 10 };
const previewCount = PREVIEW_COUNTS[userPlan] || 2;
renderProjects(previewCount);
// marchează ce plan este curent
markCurrentPlan();

// Handler pentru butonul + New Project — navighează la pagina Projects
const newBtn = document.getElementById('new-project-btn');
if (newBtn) {
    newBtn.addEventListener('click', () => {
        window.location.href = 'projects.html';
    });
}

// Ensure the row click handler is active even if render is called again
// (tableBody.__clickHandler is attached in renderProjects so this is just a safety check)
if (tableBody.__clickHandler){
    tableBody.addEventListener('click', tableBody.__clickHandler);
}

// Upgrade button is handled globally by `assets/js/upgrade.js` (clicks on #upgrade-btn open the Upgrade modal).

// 4. Logout - keep working if element exists (moved to account dropdown)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('loggedInUser'); window.location.href = 'login.html'; });
}

/* Account dropdown behavior is handled centrally in `assets/js/navbar.js` to avoid duplicated handlers and race conditions */

// 5. Ascunde link-ul 'Dashboard' în navbar dacă suntem deja pe dashboard
(function hideSelfNavLink() {
    try {
        const current = window.location.pathname.split('/').pop();
        if (current === 'dashboard.html' || current === '') {
            const dashAnchor = document.querySelector('.navbar a[href="dashboard.html"]');
            if (dashAnchor) {
                const li = dashAnchor.closest('li');
                if (li) li.style.display = 'none';
                else dashAnchor.style.display = 'none';
            }
        }
    } catch (err) {
        // nu bloca funcționalitatea principală
        console.warn('hideSelfNavLink failed', err);
    }
})();

// 6. Team Management Integration
(function initTeamManagement() {
    if (!window.TeamsManager) return; // Teams module not loaded

    const teamsManager = window.TeamsManager;
    const teamMembersList = document.getElementById('team-members-list');
    const noTeamsMessage = document.getElementById('no-teams-message');
    const createTeamBtn = document.getElementById('create-team-btn');
    const manageTeamsBtn = document.getElementById('manage-teams-btn');

    // Render team members for current user's teams
    function renderTeamMembers() {
        if (!teamMembersList) return;
        
        // Get current username
        let currentUsername = '';
        try {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                const parsed = JSON.parse(loggedInUser);
                currentUsername = parsed.username || parsed.user || parsed.name || '';
            }
        } catch (e) {
            // Ignore errors
        }
        currentUsername = String(currentUsername).trim();
        
        const userTeams = teamsManager.getUserTeams();
        teamMembersList.innerHTML = '';

        if (userTeams.length === 0) {
            if (noTeamsMessage) noTeamsMessage.style.display = 'block';
            return;
        }

        if (noTeamsMessage) noTeamsMessage.style.display = 'none';

        // Show members from all teams (or just the first team for simplicity)
        const primaryTeam = userTeams[0];
        if (primaryTeam && primaryTeam.members) {
            primaryTeam.members.forEach((member, idx) => {
                const memberEl = document.createElement('div');
                memberEl.className = 'team-member-item flex items-center justify-between py-2 px-3 mb-2 rounded-md hover:bg-gray-50';
                const roleInfo = teamsManager.ROLES[member.role] || { name: member.role };
                const memberUsername = String(member.username || '').trim();
                const isCurrentUser = currentUsername && memberUsername && currentUsername.toLowerCase() === memberUsername.toLowerCase();
                const youLabel = isCurrentUser ? ' <span class="text-xs text-gray-400 font-normal">(you)</span>' : '';
                
                memberEl.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="team-member-avatar w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                            ${(member.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-semibold text-sm">${escapeHtml(member.username)}${youLabel}</div>
                            <div class="text-xs text-gray-500">${escapeHtml(roleInfo.name)}</div>
                        </div>
                    </div>
                `;
                teamMembersList.appendChild(memberEl);
            });
        }
    }

    // Create Team Modal handlers
    const createTeamModal = document.getElementById('create-team-modal');
    const createTeamNameInput = document.getElementById('create-team-name-input');
    const createTeamDescInput = document.getElementById('create-team-desc-input');
    const createTeamError = document.getElementById('create-team-error');
    const createTeamCancel = document.getElementById('create-team-cancel');
    const createTeamSave = document.getElementById('create-team-save');

    function showCreateTeamModal() {
        if (!createTeamModal) return;
        if (createTeamNameInput) createTeamNameInput.value = '';
        if (createTeamDescInput) createTeamDescInput.value = '';
        if (createTeamError) createTeamError.textContent = '';
        createTeamModal.setAttribute('aria-hidden', 'false');
        if (createTeamNameInput) createTeamNameInput.focus();
    }

    function closeCreateTeamModal() {
        if (!createTeamModal) return;
        createTeamModal.setAttribute('aria-hidden', 'true');
    }

    if (createTeamBtn) createTeamBtn.addEventListener('click', showCreateTeamModal);
    if (createTeamCancel) createTeamCancel.addEventListener('click', (e) => { e.preventDefault(); closeCreateTeamModal(); });
    const createTeamOverlay = createTeamModal ? createTeamModal.querySelector('.modal-overlay') : null;
    if (createTeamOverlay) createTeamOverlay.addEventListener('click', closeCreateTeamModal);

    if (createTeamSave) createTeamSave.addEventListener('click', () => {
        const name = (createTeamNameInput?.value || '').trim();
        const desc = (createTeamDescInput?.value || '').trim();
        
        if (!name) {
            if (createTeamError) createTeamError.textContent = 'Team name cannot be empty.';
            if (createTeamNameInput) createTeamNameInput.focus();
            return;
        }

        const team = teamsManager.createTeam(name, desc);
        closeCreateTeamModal();
        renderTeamMembers();
        renderManageTeamsModal();
    });

    // Manage Teams Modal
    const manageTeamsModal = document.getElementById('manage-teams-modal');
    const teamsListContainer = document.getElementById('teams-list-container');
    const manageTeamsClose = document.getElementById('manage-teams-close');

    function renderManageTeamsModal() {
        if (!teamsListContainer) return;
        const userTeams = teamsManager.getUserTeams();
        teamsListContainer.innerHTML = '';

        if (userTeams.length === 0) {
            teamsListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No teams yet. Create a team to get started!</p>';
            return;
        }

        userTeams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-manage-card bg-gray-50 p-4 rounded-lg mb-3';
            const userRole = teamsManager.getUserRoleInTeam(team.id);
            const canInvite = teamsManager.hasPermission(team.id, 'invite');
            const isOwner = userRole === 'owner';
            
            teamCard.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-semibold">${escapeHtml(team.name)}</h4>
                        ${team.description ? `<p class="text-sm text-gray-600">${escapeHtml(team.description)}</p>` : ''}
                    </div>
                    <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">${escapeHtml(userRole || 'member')}</span>
                </div>
                <div class="team-members-mini mb-3">
                    <div class="text-xs font-semibold text-gray-600 mb-2">Members (${team.members.length})</div>
                    <div class="flex flex-wrap gap-2">
                        ${team.members.map(m => `
                            <div class="flex items-center gap-1 text-xs">
                                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs">
                                    ${(m.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span>${escapeHtml(m.username)}</span>
                                <span class="text-gray-400">(${escapeHtml(teamsManager.ROLES[m.role]?.name || m.role)})</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="flex gap-2 flex-wrap team-actions">
                    ${canInvite ? `<button class="btn small invite-to-team-btn" data-team-id="${team.id}">Invite Member</button>` : ''}
                    ${isOwner ? `<button class="btn small btn-danger delete-team-btn" data-team-id="${team.id}" data-team-name="${escapeHtml(team.name)}">Delete Team</button>` : ''}
                    ${!isOwner ? `<button class="btn small leave-team-btn" data-team-id="${team.id}" data-team-name="${escapeHtml(team.name)}">Leave Team</button>` : ''}
                </div>
            `;
            teamsListContainer.appendChild(teamCard);
        });

        // Attach invite button handlers
        teamsListContainer.querySelectorAll('.invite-to-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = btn.getAttribute('data-team-id');
                showInviteMemberModal(teamId);
            });
        });

        // Attach leave team button handlers
        teamsListContainer.querySelectorAll('.leave-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = btn.getAttribute('data-team-id');
                const teamName = btn.getAttribute('data-team-name');
                showLeaveTeamConfirmModal(teamId, teamName);
            });
        });

        // Attach delete team button handlers
        teamsListContainer.querySelectorAll('.delete-team-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teamId = btn.getAttribute('data-team-id');
                const teamName = btn.getAttribute('data-team-name');
                showDeleteTeamConfirmModal(teamId, teamName);
            });
        });
    }

    function showManageTeamsModal() {
        if (!manageTeamsModal) return;
        renderManageTeamsModal();
        manageTeamsModal.setAttribute('aria-hidden', 'false');
    }

    function closeManageTeamsModal() {
        if (!manageTeamsModal) return;
        manageTeamsModal.setAttribute('aria-hidden', 'true');
    }

    if (manageTeamsBtn) manageTeamsBtn.addEventListener('click', showManageTeamsModal);
    if (manageTeamsClose) manageTeamsClose.addEventListener('click', (e) => { e.preventDefault(); closeManageTeamsModal(); });
    const manageTeamsOverlay = manageTeamsModal ? manageTeamsModal.querySelector('.modal-overlay') : null;
    if (manageTeamsOverlay) manageTeamsOverlay.addEventListener('click', closeManageTeamsModal);

    // Invite Member Modal
    const inviteMemberModal = document.getElementById('invite-member-modal');
    const inviteMemberUsernameInput = document.getElementById('invite-member-username-input');
    const inviteMemberRoleSelect = document.getElementById('invite-member-role-select');
    const inviteMemberError = document.getElementById('invite-member-error');
    const inviteMemberCancel = document.getElementById('invite-member-cancel');
    const inviteMemberSave = document.getElementById('invite-member-save');
    let currentInviteTeamId = null;

    function showInviteMemberModal(teamId) {
        if (!inviteMemberModal) return;
        currentInviteTeamId = teamId;
        if (inviteMemberUsernameInput) inviteMemberUsernameInput.value = '';
        if (inviteMemberRoleSelect) inviteMemberRoleSelect.value = 'member';
        if (inviteMemberError) inviteMemberError.textContent = '';
        inviteMemberModal.setAttribute('aria-hidden', 'false');
        if (inviteMemberUsernameInput) inviteMemberUsernameInput.focus();
    }

    function closeInviteMemberModal() {
        if (!inviteMemberModal) return;
        inviteMemberModal.setAttribute('aria-hidden', 'true');
        currentInviteTeamId = null;
    }

    if (inviteMemberCancel) inviteMemberCancel.addEventListener('click', (e) => { e.preventDefault(); closeInviteMemberModal(); });
    const inviteMemberOverlay = inviteMemberModal ? inviteMemberModal.querySelector('.modal-overlay') : null;
    if (inviteMemberOverlay) inviteMemberOverlay.addEventListener('click', closeInviteMemberModal);

    if (inviteMemberSave) inviteMemberSave.addEventListener('click', () => {
        if (!currentInviteTeamId) return;
        const inviteUsername = (inviteMemberUsernameInput?.value || '').trim();
        const role = inviteMemberRoleSelect?.value || 'member';

        if (!inviteUsername) {
            if (inviteMemberError) inviteMemberError.textContent = 'Username/email cannot be empty.';
            if (inviteMemberUsernameInput) inviteMemberUsernameInput.focus();
            return;
        }

        const result = teamsManager.inviteUserToTeam(currentInviteTeamId, inviteUsername, role);
        if (result.success) {
            closeInviteMemberModal();
            renderTeamMembers();
            renderManageTeamsModal();
            showMessageDialog('Invitation Sent', `Invitation sent to ${inviteUsername}!`, 'success');
        } else {
            if (inviteMemberError) inviteMemberError.textContent = result.error || 'Failed to send invitation.';
        }
    });

    // Escape key handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (createTeamModal && createTeamModal.getAttribute('aria-hidden') === 'false') closeCreateTeamModal();
            if (manageTeamsModal && manageTeamsModal.getAttribute('aria-hidden') === 'false') closeManageTeamsModal();
            if (inviteMemberModal && inviteMemberModal.getAttribute('aria-hidden') === 'false') closeInviteMemberModal();
            const invitationsModal = document.getElementById('team-invitations-modal');
            if (invitationsModal && invitationsModal.getAttribute('aria-hidden') === 'false') {
                const closeInvitationsModal = () => invitationsModal.setAttribute('aria-hidden', 'true');
                closeInvitationsModal();
            }
        }
    });

    // Initial render
    renderTeamMembers();

    // Team Invitations Management
    const invitationsModal = document.getElementById('team-invitations-modal');
    const invitationsListContainer = document.getElementById('invitations-list-container');
    const showInvitationsBtn = document.getElementById('show-invitations-btn');
    const invitationNotificationBadge = document.getElementById('invitation-notification-badge');
    const invitationCount = document.getElementById('invitation-count');
    const invitationsClose = document.getElementById('team-invitations-close');

    function renderInvitations() {
        const pendingInvitations = teamsManager.getPendingInvitations();
        
        // Show/hide notification badge
        if (pendingInvitations.length > 0) {
            if (invitationNotificationBadge) invitationNotificationBadge.style.display = 'block';
            if (invitationCount) invitationCount.textContent = pendingInvitations.length;
        } else {
            if (invitationNotificationBadge) invitationNotificationBadge.style.display = 'none';
        }

        // Render invitations in modal
        if (!invitationsListContainer) return;
        invitationsListContainer.innerHTML = '';

        if (pendingInvitations.length === 0) {
            invitationsListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No pending invitations.</p>';
            return;
        }

        pendingInvitations.forEach(invitation => {
            const invitationCard = document.createElement('div');
            invitationCard.className = 'invitation-card bg-gray-50 p-4 rounded-lg border border-gray-200';
            const roleInfo = teamsManager.ROLES[invitation.role] || { name: invitation.role };
            
            invitationCard.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-semibold text-lg">${escapeHtml(invitation.teamName)}</h4>
                        <p class="text-sm text-gray-600">Invited by: <strong>${escapeHtml(invitation.invitedBy)}</strong></p>
                        <p class="text-sm text-gray-600">Role: <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">${escapeHtml(roleInfo.name)}</span></p>
                        <p class="text-xs text-gray-500 mt-1">${new Date(invitation.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn small accept-invitation-btn" data-invitation-id="${invitation.id}">Accept</button>
                    <button class="btn small secondary decline-invitation-btn" data-invitation-id="${invitation.id}">Decline</button>
                </div>
            `;
            invitationsListContainer.appendChild(invitationCard);
        });

        // Attach event handlers
        invitationsListContainer.querySelectorAll('.accept-invitation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const invitationId = btn.getAttribute('data-invitation-id');
                handleAcceptInvitation(invitationId);
            });
        });

        invitationsListContainer.querySelectorAll('.decline-invitation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const invitationId = btn.getAttribute('data-invitation-id');
                handleDeclineInvitation(invitationId);
            });
        });
    }

    // Message Dialog Helper
    function showMessageDialog(title, message, type = 'info') {
        const modal = document.getElementById('message-dialog-modal');
        const titleEl = document.getElementById('message-dialog-title');
        const textEl = document.getElementById('message-dialog-text');
        const okBtn = document.getElementById('message-dialog-ok');
        
        if (!modal || !titleEl || !textEl || !okBtn) {
            // Fallback to alert if modal elements not found
            alert(title + ': ' + message);
            return;
        }

        titleEl.textContent = title;
        textEl.textContent = message;
        
        // Style based on type
        if (type === 'error') {
            titleEl.style.color = '#dc2626';
        } else if (type === 'success') {
            titleEl.style.color = '#16a34a';
        } else {
            titleEl.style.color = '#111827';
        }

        modal.setAttribute('aria-hidden', 'false');
        
        // Close handler
        const closeDialog = () => {
            modal.setAttribute('aria-hidden', 'true');
        };

        okBtn.onclick = closeDialog;
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.onclick = closeDialog;
        }

        // Close on Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                closeDialog();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    function handleAcceptInvitation(invitationId) {
        const result = teamsManager.acceptInvitation(invitationId);
        if (result.success) {
            showMessageDialog('Success', 'Invitation accepted! You are now a member of the team.', 'success');
            renderInvitations();
            renderTeamMembers();
            renderManageTeamsModal();
        } else {
            showMessageDialog('Error', result.error || 'Failed to accept invitation', 'error');
        }
    }

    function handleDeclineInvitation(invitationId) {
        const result = teamsManager.declineInvitation(invitationId);
        if (result.success) {
            showMessageDialog('Invitation Declined', 'The invitation has been declined.', 'info');
            renderInvitations();
        } else {
            showMessageDialog('Error', result.error || 'Failed to decline invitation', 'error');
        }
    }

    function showInvitationsModal() {
        if (!invitationsModal) return;
        renderInvitations();
        invitationsModal.setAttribute('aria-hidden', 'false');
    }

    function closeInvitationsModal() {
        if (!invitationsModal) return;
        invitationsModal.setAttribute('aria-hidden', 'true');
    }

    if (showInvitationsBtn) {
        showInvitationsBtn.addEventListener('click', showInvitationsModal);
    }

    if (invitationsClose) {
        invitationsClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeInvitationsModal();
        });
    }

    const invitationsOverlay = invitationsModal ? invitationsModal.querySelector('.modal-overlay') : null;
    if (invitationsOverlay) {
        invitationsOverlay.addEventListener('click', closeInvitationsModal);
    }

    // Check for invitations on page load
    renderInvitations();

    // Leave Team Modal
    const leaveTeamModal = document.getElementById('leave-team-modal');
    const leaveTeamTitle = document.getElementById('leave-team-title');
    const leaveTeamMessage = document.getElementById('leave-team-message');
    const leaveTeamCancel = document.getElementById('leave-team-cancel');
    const leaveTeamConfirm = document.getElementById('leave-team-confirm');
    let currentLeaveTeamId = null;

    function showLeaveTeamConfirmModal(teamId, teamName) {
        if (!leaveTeamModal) return;
        currentLeaveTeamId = teamId;
        if (leaveTeamMessage) {
            leaveTeamMessage.textContent = `Are you sure you want to leave "${teamName}"? You will lose access to all team projects and data.`;
        }
        leaveTeamModal.setAttribute('aria-hidden', 'false');
    }

    function closeLeaveTeamModal() {
        if (!leaveTeamModal) return;
        leaveTeamModal.setAttribute('aria-hidden', 'true');
        currentLeaveTeamId = null;
    }

    if (leaveTeamCancel) leaveTeamCancel.addEventListener('click', (e) => { e.preventDefault(); closeLeaveTeamModal(); });
    const leaveTeamOverlay = leaveTeamModal ? leaveTeamModal.querySelector('.modal-overlay') : null;
    if (leaveTeamOverlay) leaveTeamOverlay.addEventListener('click', closeLeaveTeamModal);

    if (leaveTeamConfirm) leaveTeamConfirm.addEventListener('click', () => {
        if (!currentLeaveTeamId) return;
        const result = teamsManager.leaveTeam(currentLeaveTeamId);
        if (result.success) {
            showMessageDialog('Success', 'You have left the team successfully.', 'success');
            closeLeaveTeamModal();
            renderTeamMembers();
            renderManageTeamsModal();
        } else {
            showMessageDialog('Error', result.error || 'Failed to leave team', 'error');
        }
    });

    // Delete Team Modal
    const deleteTeamModal = document.getElementById('delete-team-modal');
    const deleteTeamTitle = document.getElementById('delete-team-title');
    const deleteTeamMessage = document.getElementById('delete-team-message');
    const deleteTeamCancel = document.getElementById('delete-team-cancel');
    const deleteTeamConfirm = document.getElementById('delete-team-confirm');
    let currentDeleteTeamId = null;

    function showDeleteTeamConfirmModal(teamId, teamName) {
        if (!deleteTeamModal) return;
        currentDeleteTeamId = teamId;
        if (deleteTeamMessage) {
            deleteTeamMessage.textContent = `Are you sure you want to delete "${teamName}"? This will permanently remove the team and all associated data.`;
        }
        deleteTeamModal.setAttribute('aria-hidden', 'false');
    }

    function closeDeleteTeamModal() {
        if (!deleteTeamModal) return;
        deleteTeamModal.setAttribute('aria-hidden', 'true');
        currentDeleteTeamId = null;
    }

    if (deleteTeamCancel) deleteTeamCancel.addEventListener('click', (e) => { e.preventDefault(); closeDeleteTeamModal(); });
    const deleteTeamOverlay = deleteTeamModal ? deleteTeamModal.querySelector('.modal-overlay') : null;
    if (deleteTeamOverlay) deleteTeamOverlay.addEventListener('click', closeDeleteTeamModal);

    if (deleteTeamConfirm) deleteTeamConfirm.addEventListener('click', () => {
        if (!currentDeleteTeamId) return;
        const result = teamsManager.deleteTeam(currentDeleteTeamId);
        if (result.success) {
            showMessageDialog('Success', 'Team deleted successfully.', 'success');
            closeDeleteTeamModal();
            renderTeamMembers();
            renderManageTeamsModal();
        } else {
            showMessageDialog('Error', result.error || 'Failed to delete team', 'error');
        }
    });

    // Escape key handlers for new modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (leaveTeamModal && leaveTeamModal.getAttribute('aria-hidden') === 'false') closeLeaveTeamModal();
            if (deleteTeamModal && deleteTeamModal.getAttribute('aria-hidden') === 'false') closeDeleteTeamModal();
        }
    });

    // Auto-show invitations modal if there are pending invitations (optional - can be removed if too intrusive)
    // Uncomment the line below if you want invitations to auto-show when user logs in
    // const pendingInvitations = teamsManager.getPendingInvitations();
    // if (pendingInvitations.length > 0) {
    //     setTimeout(() => showInvitationsModal(), 1000); // Show after 1 second
    // }
})();