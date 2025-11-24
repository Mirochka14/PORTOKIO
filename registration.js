document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('authForm');
    const errorMessage = document.getElementById('error-message');

    function getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    function saveUser(user) {
        const users = getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    function isPhoneTaken(phone) {
        const users = getUsers();
        return users.some(user => user.phone === phone);
    }

    function isNameTaken(name) {
        const users = getUsers();
        return users.some(user => user.name.toLowerCase() === name.toLowerCase());
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name_user').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const passwordRepeat = document.getElementById('password_repeat').value;

        if (!name || !phone || !password || !passwordRepeat) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Пожалуйста, заполните все поля!';
            return;
        }

        if (isNameTaken(name)) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Такой ник уже существует!';
            return;
        }
        if (isPhoneTaken(phone)) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Такой телефон уже зарегистрирован!';
            return;
        }
        if (password !== passwordRepeat) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Пароли не совпадают!';
            return;
        }

        // Сохраняем пользователя и устанавливаем как currentUser
        const user = {
            name: name,
            phone: phone,
            password: password // В реальном проекте — шифруйте!
        };
        saveUser(user);
        localStorage.setItem('currentUser', name);

        errorMessage.style.display = 'none';
        form.reset();

        // Перенаправляем на страницу авторизации/кабинета
        window.location.href = "authorization.html";
    });
});