// ======= REGISTER =======
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

// ======= LOGIN =======
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

// ======= CHECK LOGIN STATUS & NAVBAR =======
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const user = localStorage.getItem('loggedInUser');

    if (navbar && user) {
        const userInfo = document.createElement('span');
        userInfo.textContent = `Hello, ${user}`;
        userInfo.style.marginLeft = '20px';
        userInfo.style.fontWeight = 'bold';
        userInfo.style.color = '#fff';

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
            window.location.href = 'login.html';
        });

        navbar.appendChild(userInfo);
        navbar.appendChild(logoutBtn);

        // Hide login button if exists
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) loginBtn.style.display = 'none';
    }
});
