// navbar.js - shared behavior for account dropdown and logout
(function(){
    // Ensure account menu exists and is interactive when a user is logged in
    const sessionRaw = localStorage.getItem('loggedInUser');
    const session = sessionRaw ? (() => { try { return JSON.parse(sessionRaw); } catch(e){ return null } })() : null;
    const username = session ? (session.username || session.user || session.name || String(session)) : null;

    let accountBtn = document.getElementById('account-btn');
    let accountDropdown = document.getElementById('account-dropdown');

    // If user is logged in but the account markup isn't present on this page, inject it into .nav-right
    if (username && !accountBtn){
        const navRight = document.querySelector('.nav-right');
        if (navRight){
            const menu = document.createElement('div'); menu.className = 'account-menu'; menu.id = 'account-menu';
            accountBtn = document.createElement('button'); accountBtn.id = 'account-btn'; accountBtn.type = 'button'; accountBtn.className = 'btn small'; accountBtn.setAttribute('aria-haspopup','true'); accountBtn.setAttribute('aria-expanded','false');
            accountBtn.innerHTML = `Account <span class="account-icon">👤</span>`;
            const dropdown = document.createElement('div'); dropdown.className = 'account-dropdown'; dropdown.id = 'account-dropdown'; dropdown.setAttribute('aria-hidden','true');
            dropdown.innerHTML = `<a href="settings.html" class="dropdown-link">Settings</a><button id="logout-btn" class="dropdown-link">Log out</button>`;
            menu.appendChild(accountBtn); menu.appendChild(dropdown);
            navRight.appendChild(menu);
            accountDropdown = dropdown;
        }
    }

    // Unified toggle function
    function toggleAccountDropdown(btn) {
        const menu = btn.closest('.account-menu');
        const dropdown = menu && (menu.querySelector('#account-dropdown') || menu.querySelector('.account-dropdown'));
        if (!dropdown) return;
        
        const hidden = dropdown.getAttribute('aria-hidden') === 'true';
        // Toggle: if hidden, show it; if visible, hide it
        if (hidden) {
            // Open dropdown
            dropdown.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            dropdown.classList.add('force-show');
            dropdown.style.display = 'block';
        } else {
            // Close dropdown
            dropdown.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('force-show');
            dropdown.style.display = '';
        }
    }

    if (accountBtn && accountDropdown){
        // show username on the button (shortened) when available
        if (username) {
            const short = String(username).length > 12 ? String(username).slice(0,12) + '…' : username;
            accountBtn.innerHTML = `Account (${short}) <span class="account-icon">👤</span>`;
        }

        // Robust handlers: attach direct handlers to any existing account buttons (covers static markup)
        document.querySelectorAll('#account-btn').forEach(btn => {
            btn.addEventListener('click', (e)=>{
                e.stopPropagation();
                toggleAccountDropdown(btn);
            });
            btn.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleAccountDropdown(btn); } });
        });

        // Delegated handler to support dynamically injected buttons and to handle logout clicks
        document.addEventListener('click', (e)=>{
            // Handle logout first if clicked anywhere inside account-menu
            const logoutClick = e.target.closest && e.target.closest('#logout-btn');
            if (logoutClick){
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                window.location.href = 'login.html';
                return;
            }

            // Don't handle account button clicks here - they're handled by direct handlers above
            // But handle clicks on links inside dropdown
            const dropdownLink = e.target.closest && e.target.closest('.account-dropdown .dropdown-link');
            if (dropdownLink && dropdownLink.tagName === 'A') {
                // Allow navigation to proceed normally for Settings link
                return;
            }

            // Click outside: close all open account dropdowns
            // But keep it open if clicking inside the dropdown or its links
            if (!e.target.closest || (!e.target.closest('.account-menu') && !e.target.closest('.account-dropdown'))){
                document.querySelectorAll('.account-dropdown[aria-hidden="false"]').forEach(d => {
                    d.setAttribute('aria-hidden','true');
                    d.style.display = '';
                    d.classList.remove('force-show');
                    const btn = d.closest('.account-menu') && d.closest('.account-menu').querySelector('#account-btn');
                    if (btn) btn.setAttribute('aria-expanded','false');
                });
            }
        });
    }

    // logout button
    const logoutBtn = document.querySelector('#account-dropdown button#logout-btn') || document.getElementById('logout-btn');
    if (logoutBtn){
        logoutBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    // Keep dropdown open when hovering over menu or dropdown
    // This prevents the dropdown from closing when moving mouse to click on links
    document.querySelectorAll('.account-menu').forEach(accountMenu => {
        const dropdown = accountMenu.querySelector('.account-dropdown');
        if (!dropdown) return;

        // Keep dropdown visible when hovering over menu or dropdown
        let hoverTimeout = null;
        
        accountMenu.addEventListener('mouseenter', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (dropdown.getAttribute('aria-hidden') === 'false') {
                dropdown.style.display = 'block';
                dropdown.classList.add('force-show');
            }
        });

        dropdown.addEventListener('mouseenter', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (dropdown.getAttribute('aria-hidden') === 'false') {
                dropdown.style.display = 'block';
                dropdown.classList.add('force-show');
            }
        });

        // Close dropdown when mouse leaves both menu and dropdown
        accountMenu.addEventListener('mouseleave', (e) => {
            const relatedTarget = e.relatedTarget;
            // Check if mouse is moving to dropdown or staying in menu
            if (!relatedTarget || (!accountMenu.contains(relatedTarget) && !dropdown.contains(relatedTarget))) {
                hoverTimeout = setTimeout(() => {
                    // Double check that mouse is not over menu or dropdown
                    if (!accountMenu.matches(':hover') && !dropdown.matches(':hover')) {
                        if (dropdown.getAttribute('aria-hidden') === 'false') {
                            dropdown.setAttribute('aria-hidden', 'true');
                            dropdown.style.display = '';
                            dropdown.classList.remove('force-show');
                            const btn = accountMenu.querySelector('#account-btn');
                            if (btn) btn.setAttribute('aria-expanded', 'false');
                        }
                    }
                }, 150);
            }
        });

        dropdown.addEventListener('mouseleave', (e) => {
            const relatedTarget = e.relatedTarget;
            // Check if mouse is moving back to menu button
            if (!relatedTarget || (!accountMenu.contains(relatedTarget))) {
                hoverTimeout = setTimeout(() => {
                    if (!accountMenu.matches(':hover') && !dropdown.matches(':hover')) {
                        if (dropdown.getAttribute('aria-hidden') === 'false') {
                            dropdown.setAttribute('aria-hidden', 'true');
                            dropdown.style.display = '';
                            dropdown.classList.remove('force-show');
                            const btn = accountMenu.querySelector('#account-btn');
                            if (btn) btn.setAttribute('aria-expanded', 'false');
                        }
                    }
                }, 150);
            }
        });
    });

    // highlight active nav link
    (function markActive(){
        try{
            const current = window.location.pathname.split('/').pop() || 'dashboard.html';
            const anchor = document.querySelector(`.navbar a[href="${current}"]`);
            if (anchor) anchor.classList.add('active');
        }catch(e){}
    })();
})();