document.addEventListener('DOMContentLoaded', () => {
    
    const loginSection = document.getElementById('login-section') as HTMLElement;
    const registerSection = document.getElementById('register-section') as HTMLElement;
    const profileSection = document.getElementById('profile-section') as HTMLElement;

    const navLoginBtn = document.getElementById('nav-login-btn') as HTMLButtonElement;
    const navRegisterBtn = document.getElementById('nav-register-btn') as HTMLButtonElement;
    const navLogoutBtn = document.getElementById('nav-logout-btn') as HTMLButtonElement;

    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    const updateProfileForm = document.getElementById('update-profile-form') as HTMLFormElement;

    const messageBox = document.getElementById('message-box') as HTMLDivElement;
    const userDisplayName = document.getElementById('user-display-name') as HTMLSpanElement;

    const captchaQuestion = document.getElementById('captcha-question') as HTMLLabelElement;
    const captchaTokenInput = document.getElementById('captcha-token') as HTMLInputElement;
    const captchaAnswerInput = document.getElementById('captcha-answer') as HTMLInputElement;
    const refreshCaptchaBtn = document.getElementById('refresh-captcha-btn') as HTMLButtonElement;

    function showMessage(text: string, type: 'success' | 'error') {
        messageBox.innerText = text;
        messageBox.className = `message ${type}`;
        messageBox.style.display = 'block';
        
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    async function loadCaptcha() {
        try {
            const res = await fetch('/api/captcha');
            const data = await res.json();
            
            if (res.ok) {
                captchaQuestion.innerText = data.question;
                captchaTokenInput.value = data.captchaToken;
                captchaAnswerInput.value = ''; 
            } else {
                showMessage('Failed to load CAPTCHA security question.', 'error');
            }
        } catch (err) {
            showMessage('Network error loading CAPTCHA.', 'error');
        }
    }

    function showView(view: 'login' | 'register' | 'profile') {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        profileSection.style.display = 'none';
        
        navLoginBtn.classList.remove('active');
        navRegisterBtn.classList.remove('active');

        const token = localStorage.getItem('token');

        if (view === 'profile' && token) {
            profileSection.style.display = 'block';
            navLoginBtn.style.display = 'none';
            navRegisterBtn.style.display = 'none';
            navLogoutBtn.style.display = 'inline-block';
            
            userDisplayName.innerText = localStorage.getItem('userName') || 'User';
        } else if (view === 'register') {
            registerSection.style.display = 'block';
            navRegisterBtn.classList.add('active');
            loadCaptcha(); 
        } else {
            loginSection.style.display = 'block';
            navLoginBtn.classList.add('active');
            navLoginBtn.style.display = 'inline-block';
            navRegisterBtn.style.display = 'inline-block';
            navLogoutBtn.style.display = 'none';
        }
    }

    navLoginBtn.addEventListener('click', () => showView('login'));
    navRegisterBtn.addEventListener('click', () => showView('register'));
    refreshCaptchaBtn.addEventListener('click', loadCaptcha);

    navLogoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {}
        
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        showMessage('Logged out successfully.', 'success');
        showView('login');
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('reg-name') as HTMLInputElement;
        const emailInput = document.getElementById('reg-email') as HTMLInputElement;
        const passwordInput = document.getElementById('reg-password') as HTMLInputElement;
        const confirmPasswordInput = document.getElementById('reg-confirm-password') as HTMLInputElement;

        if (passwordInput.value !== confirmPasswordInput.value) {
        showMessage('Passwords do not match.', 'error');
            return; 
        }

        const payload = {
            full_name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            captchaAnswer: captchaAnswerInput.value,
            captchaToken: captchaTokenInput.value
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                showMessage('Registration successful! Please sign in.', 'success');
                registerForm.reset();
                showView('login');
            } else {
                const errorMsg = data.errors ? data.errors.join(', ') : data.message;
                showMessage(errorMsg || 'Registration failed', 'error');
                loadCaptcha(); 
            }
        } catch (err) {
            showMessage('Server connection failed.', 'error');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('login-email') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.full_name);
                
                loginForm.reset();
                showMessage('Login successful!', 'success');
                showView('profile');
            } else {
                showMessage(data.message || 'Invalid credentials.', 'error');
            }
        } catch (err) {
            showMessage('Server connection failed.', 'error');
        }
    });

    updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('update-name') as HTMLInputElement;
        const passwordInput = document.getElementById('update-password') as HTMLInputElement;
        const token = localStorage.getItem('token');

        if (!token) {
            showMessage('Session expired. Please log in again.', 'error');
            showView('login');
            return;
        }

        const payload: { full_name?: string; password?: string } = {};
        if (nameInput.value.trim()) payload.full_name = nameInput.value;
        if (passwordInput.value) payload.password = passwordInput.value;

        if (Object.keys(payload).length === 0) {
            showMessage('Please enter at least one field to update.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                showMessage('Profile updated successfully!', 'success');
                
                
                updateProfileForm.reset();
                if(payload.full_name) {
                    localStorage.setItem('userName', payload.full_name);
                    userDisplayName.innerText = localStorage.getItem('userName') || 'User';
                }
            } else {
                const errorMsg = data.errors ? data.errors.join(', ') : data.message;
                showMessage(errorMsg || 'Update failed', 'error');
            }
        } catch (err) {
            showMessage('Server connection failed.', 'error');
            console.log(err)
        }
    });

    async function checkInitialSession() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            showView('login');
            return;
        }

        try {
            const res = await fetch('/api/user/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (res.ok) {
                const data = await res.json();
                
                localStorage.setItem('userName', data.user.full_name);
                
                showView('profile');
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                showView('login');
                showMessage('Your session has expired. Please log in again.', 'error');
            }
        } catch (err) {
            showMessage('Working offline. Unable to verify session.', 'error');
            showView('profile');
        }
    }

    checkInitialSession();
});