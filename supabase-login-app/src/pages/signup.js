const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const { user, error } = await supabase.auth.signUp({
            email: username,
            password: password,
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Signup successful! Please check your email for verification.');
            window.location.href = '/pages/login.html';
        }
    });
});