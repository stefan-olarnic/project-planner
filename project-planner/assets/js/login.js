(async function(){
    // Helpers
    async function hashPassword(pw){
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
        return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    function validateEmail(email){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePasswordRules(pw){
        const errors = [];
        if (pw.length < 8) errors.push('Minimum 8 characters');
        if (!/[a-z]/.test(pw)) errors.push('Include lowercase letters');
        if (!/[A-Z]/.test(pw)) errors.push('Include uppercase letters');
        if (!/[0-9]/.test(pw)) errors.push('Include at least one digit');
        if (!/[!@#$%^&*()_+\-=[\]{};:\"'\\|,.<>/?]+/.test(pw)) errors.push('Include at least one special character');
        return errors;
    }
    function getUsers(){ return JSON.parse(localStorage.getItem('users') || '[]'); }
    function saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }

    // Initialize default users (hashed)
    if (!localStorage.getItem('users')){
        const defaults = [
            { username: 'admin', email: 'admin@example.com', password: '1234', plan: 'free' },
            { username: 'user', email: 'user@example.com', password: 'abcd', plan: 'free' }
        ];
        // Hash passwords before storing
        for (const d of defaults){ d.passwordHash = await hashPassword(String(d.password)); delete d.password; }
        saveUsers(defaults);
    }

    // UI elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    const showRegisterBtn = document.getElementById('show-register');
    const registerForm = document.getElementById('register-form');
    const regEmail = document.getElementById('reg-email');
    const regUsername = document.getElementById('reg-username');
    const regPassword = document.getElementById('reg-password');
    const regPasswordConfirm = document.getElementById('reg-password-confirm');
    const regError = document.getElementById('reg-error');
    const registerBtn = document.getElementById('register-btn');
    const registerCancel = document.getElementById('register-cancel');

    function showRegister(){ registerForm.classList.remove('hidden'); showRegisterBtn.setAttribute('aria-hidden','true'); }
    function hideRegister(){ registerForm.classList.add('hidden'); showRegisterBtn.removeAttribute('aria-hidden'); regError.textContent = ''; regEmail.value = ''; regUsername.value = ''; regPassword.value = ''; regPasswordConfirm.value = ''; }

    showRegisterBtn.addEventListener('click', (e)=>{ e.preventDefault(); showRegister(); });
    registerCancel.addEventListener('click', (e)=>{ e.preventDefault(); hideRegister(); });

    // Login handler (supports username or email)
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        errorMsg.textContent = '';
        const loginValue = usernameInput.value.trim();
        const pw = passwordInput.value || '';
        const users = getUsers();
        const found = users.find(u => u.username === loginValue || u.email === loginValue);
        if (!found){ errorMsg.textContent = 'Username sau email inexistent.'; return; }
        // if user still has legacy plain `password` field, support it and migrate
        if (found.password){
            if (found.password === pw){
                // migrate to hash
                found.passwordHash = await hashPassword(pw); delete found.password; saveUsers(users);
            } else { errorMsg.textContent = 'Incorrect password.'; return; }
        } else if (found.passwordHash){
            const h = await hashPassword(pw);
            if (h !== found.passwordHash){ errorMsg.textContent = 'Incorrect password.'; return; }
        } else {
            errorMsg.textContent = 'Account corrupted - contact support.'; return;
        }
        // Save minimal session (no password)
        const session = { username: found.username, plan: found.plan || 'free' };
        localStorage.setItem('loggedInUser', JSON.stringify(session));
        window.location.href = 'dashboard.html';
    });

    // Registration handler
    registerBtn.addEventListener('click', async (e)=>{
        e.preventDefault(); regError.textContent = '';
        const email = String(regEmail.value || '').trim();
        const username = String(regUsername.value || '').trim();
        const pw = String(regPassword.value || '');
        const pw2 = String(regPasswordConfirm.value || '');

        if (!validateEmail(email)) { regError.textContent = 'Invalid email.'; return; }
        if (!username || username.length < 3) { regError.textContent = 'Username must be at least 3 characters.'; return; }
        const pwErrors = validatePasswordRules(pw);
        if (pwErrors.length) { regError.textContent = 'Invalid password: ' + pwErrors.join(', '); return; }
        if (pw !== pw2) { regError.textContent = 'Passwords do not match.'; return; }

        const users = getUsers();
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) { regError.textContent = 'Username already taken.'; return; }
        if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) { regError.textContent = 'Email already used.'; return; }

        const pwHash = await hashPassword(pw);
        const newUser = { username, email, passwordHash: pwHash, plan: 'free', createdAt: Date.now() };
        users.push(newUser);
        saveUsers(users);

        // Auto-login new user (store minimal session)
        const session = { username: newUser.username, plan: newUser.plan };
        localStorage.setItem('loggedInUser', JSON.stringify(session));
        window.location.href = 'dashboard.html';
    });

})();
