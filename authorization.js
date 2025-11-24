document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('authForm');
    const errorMessage = document.getElementById('error-message');

    function getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;

        if (!phone || !password) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Пожалуйста, заполните все поля!';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Неправильный телефон или пароль!';
            return;
        }

        errorMessage.style.display = 'none';
        // ВАЖНО: логиним пользователя!
        localStorage.setItem('currentUser', user.name);

        // После авторизации переходим на страницу профиля
        window.location.href = "index.html"; // Замените на вашу страницу профиля
    });
});