// upgrade.js - global upgrade modal and handler
(function(){
    const MAGIC_WORD = 'abracadabra'; // chosen magic word

    // create modal markup once and append to body
    if (!document.getElementById('global-upgrade-modal')){
        const html = `
<div id="global-upgrade-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="upgrade-title">
  <div class="modal-overlay" data-close="true"></div>
  <div class="modal-panel">
    <h3 id="upgrade-title">Upgrade to Pro</h3>
    <div class="space-y-3">
      <p>Say the magic word to upgrade your account to <strong>Pro</strong>:</p>
      <label class="text-sm">Magic word</label>
      <input id="upgrade-input" class="w-full px-3 py-2 border rounded-md" placeholder="Say the magic word" />
      <div id="upgrade-error" class="text-sm"></div>
      <div class="modal-actions">
        <button id="upgrade-cancel" class="btn secondary">Cancel</button>
        <button id="upgrade-confirm" class="btn">Upgrade</button>
      </div>
    </div>
  </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    const modal = document.getElementById('global-upgrade-modal');
    const input = document.getElementById('upgrade-input');
    const err = document.getElementById('upgrade-error');
    const cancel = document.getElementById('upgrade-cancel');
    const confirmBtn = document.getElementById('upgrade-confirm');

    function isUserPro(){
        const raw = localStorage.getItem('loggedInUser');
        if (!raw) return false;
        try{ const parsed = JSON.parse(raw); return String(parsed.plan || parsed.type || parsed.role || '').toLowerCase() === 'pro'; }catch(e){ return false; }
    }

    // Hide upgrade triggers on pages when user already has PRO plan
    if (isUserPro()){
        const nodes = document.querySelectorAll('#upgrade-btn, #limit-upgrade, [data-upgrade]');
        nodes.forEach(n => { try{ n.style.display = 'none'; }catch(e){} });
        if (modal) modal.setAttribute('aria-hidden','true');
    }

    function openModal(){ 
        if (!modal) return; 
        if (isUserPro()) return; 
        err.textContent = ''; 
        err.className = 'text-sm'; // Reset to default
        input.value = ''; 
        modal.setAttribute('aria-hidden','false'); 
        input.focus(); 
    }
    function closeModal(){ if (!modal) return; modal.setAttribute('aria-hidden','true'); }

    // Attach handlers
    document.addEventListener('click', (e)=>{
        // clicks on any upgrade trigger: id=upgrade-btn or id=limit-upgrade or data-upgrade attribute
        const trg = e.target.closest && (e.target.closest('#upgrade-btn') || e.target.closest('#limit-upgrade') || e.target.closest('[data-upgrade]'));
        if (trg){
            e.preventDefault(); openModal();
        }
        // overlay/cancel
        if (e.target.closest && e.target.closest('#global-upgrade-modal .modal-overlay')){ closeModal(); }
    }, true);

    if (cancel) cancel.addEventListener('click', (e)=>{ e.preventDefault(); closeModal(); });

    function getLoggedInUser(){ const raw = localStorage.getItem('loggedInUser'); if (!raw) return null; try{ return JSON.parse(raw); }catch(e){ return String(raw); } }
    function setLoggedInUser(u){ if (!u) return; try{ localStorage.setItem('loggedInUser', JSON.stringify(u)); }catch(e){ localStorage.setItem('loggedInUser', String(u)); } }

    function promoteToPro(){
        // update loggedInUser
        const raw = localStorage.getItem('loggedInUser');
        if (!raw) return;
        try{
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object'){
                parsed.plan = 'pro';
                localStorage.setItem('loggedInUser', JSON.stringify(parsed));
                // also update in users list if present
                try{ const users = JSON.parse(localStorage.getItem('users') || '[]'); const idx = users.findIndex(u=>u.username && parsed.username && u.username === parsed.username); if (idx !== -1){ users[idx].plan = 'pro'; localStorage.setItem('users', JSON.stringify(users)); } }catch(e){}
            } else {
                // raw is not JSON; treat as username string
                const username = String(parsed);
                try{ const users = JSON.parse(localStorage.getItem('users') || '[]'); const idx = users.findIndex(u=>u.username && u.username === username); if (idx !== -1){ users[idx].plan = 'pro'; localStorage.setItem('users', JSON.stringify(users)); setLoggedInUser(Object.assign({}, users[idx])); } else { /* fallback: set loggedInUser to object */ setLoggedInUser({ username, plan:'pro' }); }}catch(e){ setLoggedInUser({ username, plan:'pro' }); }
            }
        }catch(e){
            // not JSON
            const username = String(raw);
            try{ const users = JSON.parse(localStorage.getItem('users') || '[]'); const idx = users.findIndex(u=>u.username && u.username === username); if (idx !== -1){ users[idx].plan = 'pro'; localStorage.setItem('users', JSON.stringify(users)); setLoggedInUser(Object.assign({}, users[idx])); } else { setLoggedInUser({ username, plan:'pro' }); }}catch(ex){ setLoggedInUser({ username, plan:'pro' }); }
        }

        // feedback and reload to apply UI changes
        if (err) {
            err.textContent = 'Upgrade successful! Applying changes...';
            err.className = 'text-sm text-green-600'; // Green color for success
        }
        setTimeout(()=>{ closeModal(); window.location.reload(); }, 900);
    }

    if (confirmBtn) confirmBtn.addEventListener('click', (e)=>{
        e.preventDefault(); 
        const val = (input.value || '').trim().toLowerCase(); 
        if (!val){ 
            err.textContent = 'Please enter the magic word.'; 
            err.className = 'text-sm text-red-600'; // Red for errors
            input.focus(); 
            return; 
        }
        if (val === MAGIC_WORD){ 
            promoteToPro(); 
        } else { 
            err.textContent = 'Wrong magic word. Try again.'; 
            err.className = 'text-sm text-red-600'; // Red for errors
            input.focus(); 
        }
    });

    // support Enter key in input
    if (input){ input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter'){ e.preventDefault(); confirmBtn.click(); } }); }

    // Downgrade functionality
    function demoteToFree(){
        const raw = localStorage.getItem('loggedInUser');
        if (!raw) return;
        try{
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object'){
                parsed.plan = 'free';
                localStorage.setItem('loggedInUser', JSON.stringify(parsed));
                // also update in users list if present
                try{ 
                    const users = JSON.parse(localStorage.getItem('users') || '[]'); 
                    const idx = users.findIndex(u=>u.username && parsed.username && u.username === parsed.username); 
                    if (idx !== -1){ 
                        users[idx].plan = 'free'; 
                        localStorage.setItem('users', JSON.stringify(users)); 
                    } 
                }catch(e){}
            } else {
                // raw is not JSON; treat as username string
                const username = String(parsed);
                try{ 
                    const users = JSON.parse(localStorage.getItem('users') || '[]'); 
                    const idx = users.findIndex(u=>u.username && u.username === username); 
                    if (idx !== -1){ 
                        users[idx].plan = 'free'; 
                        localStorage.setItem('users', JSON.stringify(users)); 
                        setLoggedInUser(Object.assign({}, users[idx])); 
                    } else { 
                        setLoggedInUser({ username, plan:'free' }); 
                    }
                }catch(e){ 
                    setLoggedInUser({ username, plan:'free' }); 
                }
            }
        }catch(e){
            // not JSON
            const username = String(raw);
            try{ 
                const users = JSON.parse(localStorage.getItem('users') || '[]'); 
                const idx = users.findIndex(u=>u.username && u.username === username); 
                if (idx !== -1){ 
                    users[idx].plan = 'free'; 
                    localStorage.setItem('users', JSON.stringify(users)); 
                    setLoggedInUser(Object.assign({}, users[idx])); 
                } else { 
                    setLoggedInUser({ username, plan:'free' }); 
                }
            }catch(ex){ 
                setLoggedInUser({ username, plan:'free' }); 
            }
        }
        // Reload to apply UI changes
        window.location.reload();
    }

    // Create downgrade modal
    if (!document.getElementById('global-downgrade-modal')){
        const downgradeHtml = `
<div id="global-downgrade-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="downgrade-title">
  <div class="modal-overlay" data-close="true"></div>
  <div class="modal-panel">
    <h3 id="downgrade-title">Downgrade to Free</h3>
    <div class="space-y-3">
      <p>Are you sure you want to downgrade your account to <strong>Free</strong> plan?</p>
      <p class="text-sm text-gray-600">You will lose access to Pro features. Your existing projects will remain, but you'll be limited to the Free plan restrictions.</p>
      <div id="downgrade-error" class="text-sm"></div>
      <div class="modal-actions">
        <button id="downgrade-cancel" class="btn secondary">Cancel</button>
        <button id="downgrade-confirm" class="btn btn-danger">Downgrade to Free</button>
      </div>
    </div>
  </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', downgradeHtml);
    }

    const downgradeModal = document.getElementById('global-downgrade-modal');
    const downgradeCancel = document.getElementById('downgrade-cancel');
    const downgradeConfirm = document.getElementById('downgrade-confirm');

    function openDowngradeModal(){ 
        if (!downgradeModal) return; 
        if (!isUserPro()) return; // Only show if user is Pro
        downgradeModal.setAttribute('aria-hidden','false'); 
    }

    function closeDowngradeModal(){ 
        if (!downgradeModal) return; 
        downgradeModal.setAttribute('aria-hidden','true'); 
    }

    // Attach downgrade handlers
    document.addEventListener('click', (e)=>{
        // clicks on downgrade trigger
        const trg = e.target.closest && e.target.closest('#downgrade-btn');
        if (trg){
            e.preventDefault(); 
            openDowngradeModal();
        }
        // overlay/cancel for downgrade modal
        if (e.target.closest && e.target.closest('#global-downgrade-modal .modal-overlay')){ 
            closeDowngradeModal(); 
        }
    }, true);

    if (downgradeCancel) downgradeCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeDowngradeModal(); });
    if (downgradeConfirm) downgradeConfirm.addEventListener('click', (e)=>{ 
        e.preventDefault(); 
        demoteToFree(); 
    });

    // Support Escape key for downgrade modal
    document.addEventListener('keydown', (e)=>{
        if (e.key === 'Escape'){
            if (downgradeModal && downgradeModal.getAttribute('aria-hidden') === 'false'){
                closeDowngradeModal();
            }
        }
    });

})();