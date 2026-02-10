function showLogin() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');

    signupCard.style.display = 'none';
    loginCard.style.display = 'block';

    loginCard.style.animation = 'none';
    setTimeout(() => {
        loginCard.style.animation = 'fadeIn 0.4s ease';
    }, 10);
}

function showSignup() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');

    loginCard.style.display = 'none';
    signupCard.style.display = 'block';

    signupCard.style.animation = 'none';
    setTimeout(() => {
        signupCard.style.animation = 'fadeIn 0.4s ease';
    }, 10);
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#loginCard form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            console.log('Login attempt:', { email, password });
            alert('Login functionality would be implemented here');
        });
    }

    const signupForm = document.querySelector('#signupCard form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fullName = document.getElementById('signupFullName').value;
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const password = document.getElementById('signupPassword').value;

            if (!fullName || !username || !email || !password) {
                alert('Please fill in all required fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            if (phone) {
                const phoneRegex = /^[0-9]{10}$/;
                const cleanPhone = phone.replace(/\D/g, '');
                if (cleanPhone.length < 10) {
                    alert('Please enter a valid phone number');
                    return;
                }
            }

            console.log('Registration attempt:', { fullName, username, email, phone, password });
            alert('Registration functionality would be implemented here');
        });
    }

    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'l' && !e.target.matches('input, textarea')) {
        showLogin();
    }

    if (e.key === 'r' && !e.target.matches('input, textarea')) {
        showSignup();
    }
});
