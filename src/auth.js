// AUTH.JS - handles login, logout and navbar update

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');

    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));

    // Update navbar based on login state
    if (loggedIn && user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        welcomeUser.textContent = `Hello, ${user.username}`;
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        welcomeUser.textContent = '';
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('user');
            alert('You have been logged out.');
            window.location.href = 'index.html';
        });
    }

    // Handle login form (if on login page)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username && password) {
                const user = { username };
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('user', JSON.stringify(user));
                alert(`Welcome, ${username}!`);
                window.location.href = 'index.html';
            } else {
                alert('Please enter both username and password.');
            }
        });
    }
});
