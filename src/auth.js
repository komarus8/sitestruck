// ======= REJESTRACJA =======
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (localStorage.getItem(username)) {
            alert('User already exists!');
        } else {
            localStorage.setItem(username, password);
            alert('Registration successful!');
            window.location.href = 'login.html';
        }
    });
}

// ======= LOGOWANIE =======
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const storedPassword = localStorage.getItem(username);
        if (storedPassword && storedPassword === password) {
            localStorage.setItem('loggedInUser', username);
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert('Invalid username or password');
        }
    });
}

// ======= SPRAWDZENIE STANU NA STRONIE GŁÓWNEJ =======
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    const navbar = document.querySelector('.navbar');
    const user = localStorage.getItem('loggedInUser');

    if (user) {
        const userSpan = document.createElement('span');
        userSpan.textContent = `Witaj, ${user}`;
        userSpan.style.marginLeft = '20px';
        userSpan.style.fontWeight = 'bold';

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.marginLeft = '20px';
        logoutBtn.style.background = '#ff4c4c';
        logoutBtn.style.color = 'white';
        logoutBtn.style.border = 'none';
        logoutBtn.style.padding = '8px 12px';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.borderRadius = '5px';

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });

        navbar.appendChild(userSpan);
        navbar.appendChild(logoutBtn);

        // Ukryj przycisk login
        const loginLink = document.querySelector('.login-btn');
        if (loginLink) loginLink.style.display = 'none';
    }
}

