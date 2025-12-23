// settings.js
(function(){
    const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    document.getElementById('acct-username').textContent = session.username || '—';
    // get email from users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const u = users.find(x => x.username === session.username) || {};
    document.getElementById('acct-email').textContent = u.email || '—';
    const plan = (session.plan || 'free').toUpperCase();
    document.getElementById('acct-plan').textContent = plan;

    // Manage plan badge and buttons
    (function managePlanSection(){
        const upgradeBtn = document.getElementById('upgrade-btn');
        const downgradeBtn = document.getElementById('downgrade-btn');
        const planBadge = document.getElementById('plan-badge');
        const isPro = String(session.plan || '').toLowerCase() === 'pro';
        
        if (planBadge) {
            if (isPro) {
                planBadge.textContent = 'You are on Pro ✓';
                planBadge.style.background = 'linear-gradient(90deg, var(--color-major), var(--color-lavender))';
            } else {
                planBadge.textContent = 'Free Plan';
                planBadge.style.background = 'linear-gradient(90deg, #94a3b8, #64748b)';
            }
        }
        
        if (isPro){
            // Hide upgrade button, show downgrade button
            if (upgradeBtn) upgradeBtn.style.display = 'none';
            if (downgradeBtn) {
                downgradeBtn.style.display = '';
                downgradeBtn.textContent = 'Downgrade to Free';
            }
        } else {
            // Show upgrade button, hide downgrade button
            if (upgradeBtn) { 
                upgradeBtn.textContent = 'Upgrade to Pro'; 
                upgradeBtn.style.display = ''; 
            }
            if (downgradeBtn) downgradeBtn.style.display = 'none';
        }
    })();

    // logout handler in settings
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('loggedInUser'); window.location.href='login.html'; });

})();