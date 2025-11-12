function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.classList.add('navbar');

    const logo = document.createElement('div');
    logo.classList.add('logo');
    logo.textContent = 'Supabase Login App';
    navbar.appendChild(logo);

    const navLinks = document.createElement('ul');
    navLinks.classList.add('nav-links');

    const loginLink = document.createElement('li');
    loginLink.innerHTML = '<a href="login.html">Login</a>';
    navLinks.appendChild(loginLink);

    const signupLink = document.createElement('li');
    signupLink.innerHTML = '<a href="signup.html">Sign Up</a>';
    navLinks.appendChild(signupLink);

    navbar.appendChild(navLinks);
    document.body.prepend(navbar);
}

export default createNavbar;