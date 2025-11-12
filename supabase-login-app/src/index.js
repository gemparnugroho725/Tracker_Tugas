const supabase = require('./utils/supabase');

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = './pages/login.html';
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', () => {
            window.location.href = './pages/signup.html';
        });
    }
});