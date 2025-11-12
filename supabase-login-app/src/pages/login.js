import { supabase } from '../utils/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });

        if (error) {
            errorMessage.textContent = error.message;
        } else {
            window.location.href = '/'; // Redirect to the main page on successful login
        }
    });
});