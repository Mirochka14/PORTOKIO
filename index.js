const track = document.getElementById('carouselTrack');
const slides = Array.from(track.children);

const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const dots = Array.from(document.querySelectorAll('.carousel-dot'));
const container = document.getElementById('carousel');
const slideWidth = slides[0].getBoundingClientRect().width;
const AUTO_SLIDE_DELAY = 3000;

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

firstClone.setAttribute('data-clone', 'first');
lastClone.setAttribute('data-clone', 'last');


track.appendChild(firstClone);
track.insertBefore(lastClone, track.firstChild);

let currentIndex = 1; 

let autoSlideInterval = null;

let isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0, animationID = 0;

const allSlides = Array.from(track.children);

function setSlidePosition(index, animate = true) {
    if (animate) {
        track.style.transition = 'transform 0.7s cubic-bezier(.39,.8,.54,1)';
    } else {
        track.style.transition = 'none';
    }
    currentTranslate = -index * slideWidth;
    track.style.transform = `translateX(${currentTranslate}px)`;

    let realIdx = (index-1+slides.length)%slides.length;
    slides.forEach((slide, i) => {
        slide.style.pointerEvents = (realIdx === i) ? "auto" : "none";
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === realIdx));
}

function nextSlide() {
    if (currentIndex >= allSlides.length - 1) return;
    currentIndex++;
    setSlidePosition(currentIndex, true);
}

function prevSlide() {
    if (currentIndex <= 0) return;
    currentIndex--;
    setSlidePosition(currentIndex, true);
}

document.addEventListener('DOMContentLoaded', function () {
    // Находим ссылку Войти (в enter > .autoriz_link)
    const enterDiv = document.querySelector('.enter');
    if (!enterDiv) return;
    const authLink = enterDiv.querySelector('.autoriz_link');
    if (!authLink) return;

    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const isAuthorized = !!(currentUser && users.some(u => u.name === currentUser));

    if (isAuthorized) {
        authLink.textContent = 'Выйти';
        authLink.href = '#logout'; // Оставим как якорь, чтобы не переходило

        authLink.addEventListener('click', function (e) {
            e.preventDefault();
            // Выход из аккаунта: удаляем currentUser, перезагрузить
            localStorage.removeItem('currentUser');
            // Можно popup "Вы успешно вышли" (опционально)
            // location.reload(); // вариант 1
            // Или перейти на главную
            window.location.href = 'index.html';
        });
    } else {
        authLink.textContent = 'Войти';
        authLink.href = 'authorization.html';
    }
});
track.addEventListener('transitionend', () => {
    if (allSlides[currentIndex].getAttribute('data-clone') === 'first') {

        track.style.transition = 'none';
        currentIndex = 1;
        setSlidePosition(currentIndex, false);
    } else if (allSlides[currentIndex].getAttribute('data-clone') === 'last') {

        track.style.transition = 'none';
        currentIndex = slides.length;
        setSlidePosition(currentIndex, false);
    }
});

function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, AUTO_SLIDE_DELAY);
}
function resetAutoSlide() { startAutoSlide(); }

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
});
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
});
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        currentIndex = i + 1;
        setSlidePosition(currentIndex, true);
        resetAutoSlide();
    });
});


container.addEventListener('mousedown', startDrag);
container.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    startX = getX(e);
    prevTranslate = -currentIndex * slideWidth;
    track.style.transition = 'none';
    document.body.style.cursor = "grabbing";

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    clearInterval(autoSlideInterval);
}
function drag(e) {
    if (!isDragging) return;
    e.preventDefault?.();
    const x = getX(e);
    const moveDelta = x - startX;
    currentTranslate = prevTranslate + moveDelta;
    track.style.transform = `translateX(${currentTranslate}px)`;
}
function endDrag(e) {
    isDragging = false;
    document.body.style.cursor = "";
    const x = getX(e), movedBy = x - startX;
    if (Math.abs(movedBy) > slideWidth * 0.15) {
        if (movedBy < 0) nextSlide();
        else prevSlide();
    } else {
        setSlidePosition(currentIndex, true);
    }
    startAutoSlide();

    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', drag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchend', endDrag);
}
function getX(e) {
    if (e.touches) return e.touches[0].clientX;
    return e.clientX;
}
allSlides.forEach(s => {
    s.addEventListener('dragstart', e => e.preventDefault());
});
setSlidePosition(currentIndex, false);
startAutoSlide();

// Resize
window.addEventListener('resize', () => {
    setTimeout(() => {
        setSlidePosition(currentIndex, false);
    }, 100);
});

(function() {
    const images = [
        document.getElementById('img1'),
        document.getElementById('img2'),
        document.getElementById('img3')
    ];
    let idx = 0;

    function startCycle() {
        images.forEach(img => img.classList.remove('glow'));
        images[idx].classList.add('glow');
        let prev = (idx + images.length - 1) % images.length;
        images[prev].classList.remove('glow');
        idx = (idx + 1) % images.length;
    }

    // Initial highlight to the first image only
    images.forEach(img => img.classList.remove('glow'));
    images[0].classList.add('glow');

    setInterval(startCycle, 1800);
})();

// JS для блока профиля: Проверка авторизации, добавление/редактирование данных, аватара и обоев на кнопки
document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const profileArticle = document.getElementById('profile');
    const nameSpan = profileArticle.querySelectorAll('.profile_row .profile_value')[0];
    const activitySpan = profileArticle.querySelectorAll('.profile_row .profile_value')[1];
    const experienceSpan = profileArticle.querySelectorAll('.profile_row .profile_value')[2];
    const contactsSpan = profileArticle.querySelectorAll('.profile_row .profile_value')[3];
    const editBtn = profileArticle.querySelector('.edit_profile_btn');
    const avatarInput = document.getElementById('upload');
    const wallpaperInput = document.getElementById('upload_two');
    const avatarLabel = profileArticle.querySelector('.circle_button');
    const wallpaperLabel = profileArticle.querySelector('.back_button');
    const nameImg = profileArticle.querySelector('.name_div');

    // ---------- 1. Получение пользователя по currentUser ----------
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.name === currentUser);

    // Если не авторизован — можно использовать заглушки, но имя не ставить
    if (!user) user = {};

    // ---------- 2. Загрузка данных в профиль ----------
    nameSpan.textContent = user.name || '';
    activitySpan.textContent = user.activity || 'а тут чем вы занимаетесь';
    experienceSpan.textContent = user.experience || 'сколько вы проработали';
    contactsSpan.textContent = user.contacts || 'и как с вами связаться';

    // ---------- 2.1 Устанавливаем сохранённую аватарку ТОЛЬКО на кнопку ----------
    if (user.avatar) {
        avatarLabel.style.backgroundImage = `url(${user.avatar})`;
        avatarLabel.style.backgroundSize = 'cover';
        avatarLabel.style.backgroundPosition = 'center';
    }
    // ---------- 2.2 Устанавливаем сохранённые обои ТОЛЬКО на кнопку ----------
    if (user.wallpaper) {
        wallpaperLabel.style.backgroundImage = `url(${user.wallpaper})`;
        wallpaperLabel.style.backgroundSize = 'cover';
        wallpaperLabel.style.backgroundPosition = 'center';
    }

    // ---------- 3. Загрузка аватарки (только на кнопку) ----------
    avatarInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            avatarLabel.style.backgroundImage = `url(${evt.target.result})`;
            avatarLabel.style.backgroundSize = 'cover';
            avatarLabel.style.backgroundPosition = 'center';
            user.avatar = evt.target.result;
            updateUser(user);
        };
        reader.readAsDataURL(file);
    });

    // ---------- 4. Загрузка обоев (только на кнопку) ----------
    wallpaperInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            wallpaperLabel.style.backgroundImage = `url(${evt.target.result})`;
            wallpaperLabel.style.backgroundSize = 'cover';
            wallpaperLabel.style.backgroundPosition = 'center';
            user.wallpaper = evt.target.result;
            updateUser(user);
        };
        reader.readAsDataURL(file);
    });

    // ---------- 5. Редактирование профиля (Имя нельзя менять) ----------
    editBtn.addEventListener('click', function () {
        let formDiv = document.createElement('div');
        formDiv.style.position = 'fixed';
        formDiv.style.left = '0'; 
        formDiv.style.top = '0';
        formDiv.style.width = '100vw'; 
        formDiv.style.height = '100vh';
        formDiv.style.zIndex = 2000; 
        formDiv.style.background = 'rgba(0,0,0,0.55)';
        formDiv.style.display = 'flex'; 
        formDiv.style.justifyContent = 'center';
        formDiv.style.alignItems = 'center';

        function option(act) {
            return `<option value="${act}"${user.activity === act ? ' selected' : ''}>${act}</option>`;
        }
        let activities = [
            'Веб-разработчик', 'Графический дизайнер', 'Фотограф', 'Арт-директор', 'Видеограф',
            '3D-моделлер', 'Анимация', 'Иллюстратор', 'Копирайтер', 'Музыкант',
            'Моушн-дизайнер', 'Мобильный разработчик', 'Архитектор', 'Видеомонтажёр',
            'SMM-специалист', 'SEO-специалист', 'PR-менеджер', 'Писатель', 'Инженер-конструктор',
            'UI/UX-дизайнер', 'Продюсер', 'Режиссёр', 'Режиссёр монтажа',
            'Режиссёр звукозаписи', 'Переводчик', 'Модельер', 'Контент-менеджер', 'Эксперт по визуализации',
            'Product-менеджер', 'Дизайнер интерфейсов', 'Бренд-менеджер', 'Музыкальный продюсер', 'Строитель', 'HR',
            'Юрист', 'Организатор мероприятий', 'Тестировщик', 'Разработчик ИИ', 'Научный сотрудник'
        ];

        formDiv.innerHTML = `<form id="editProfileForm"
        style="background:#fff;border-radius:34px;padding:38px 48px;width:480px;box-shadow:0 2px 24px #dd5b98;font-size:20px;">
            <div style="margin-bottom:32px;">Имя:<br>
             <b>${user.name || ''}</b>
            </div>
            <div style="margin-bottom:26px;">
               Вид деятельности: <br>
               <select name="activity" style="width:100%;margin-top:6px;padding:5px 6px;font-size:16px;">
                <option value="">Выберите вид деятельности</option>
                ${activities.map(option).join('')}
               </select>
            </div>
            <div style="margin-bottom:20px;">
                Стаж работы: <br>
                <input name="experience" type="text" maxlength="64" style="width:100%;margin-top:6px;padding:5px 6px;font-size:16px;" value="${user.experience || ''}">
            </div>
            <div style="margin-bottom:20px;">
                Контакты: <br>
                <input name="contacts" type="text" maxlength="128" style="width:100%;margin-top:6px;padding:5px 6px;font-size:16px;" value="${user.contacts || ''}">
            </div>
            <button type="submit" style="margin-top:18px;background:#e1749e;color:#fff;border:none;border-radius:10px;padding:11px 34px;font-size:18px;cursor:pointer;">Сохранить</button>
       </form>`;

        document.body.appendChild(formDiv);

        formDiv.querySelector('#editProfileForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const fd = new FormData(e.target);
            user.activity = fd.get('activity');
            user.experience = fd.get('experience');
            user.contacts = fd.get('contacts');
            activitySpan.textContent = user.activity || 'а тут чем вы занимаетесь';
            experienceSpan.textContent = user.experience || 'сколько вы проработали';
            contactsSpan.textContent = user.contacts || 'и как с вами связаться';
            updateUser(user);
            document.body.removeChild(formDiv);
        });

        formDiv.addEventListener('click', function (evt) {
            if (evt.target === formDiv) document.body.removeChild(formDiv);
        });
    });

    // ------- 6. Обновить пользователя в базе -------

    function updateUser(newData) {
        if (!newData.name) return;
        let usersArr = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = usersArr.findIndex(u => u.name === newData.name);
        if (idx !== -1) {
            usersArr[idx] = newData;
            localStorage.setItem('users', JSON.stringify(usersArr));
        }
        user = newData;
    }
});
// Если клиент не авторизован, запретить любые взаимодействия с профилем (кроме просмотра, если разрешено)
document.addEventListener('DOMContentLoaded', function () {
    // Проверка авторизации пользователя
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const isAuthorized = !!(currentUser && users.some(u => u.name === currentUser));

    const profileArticle = document.getElementById('profile');
    if (!profileArticle) return;

    // Селекторы для кнопок и элементов редактирования профиля
    const editBtn = profileArticle.querySelector('.edit_profile_btn');
    const avatarInput = document.getElementById('upload');
    const wallpaperInput = document.getElementById('upload_two');
    const avatarLabel = profileArticle.querySelector('.circle_button');
    const wallpaperLabel = profileArticle.querySelector('.back_button');
    const deleteBtn = document.getElementById('delete-account-btn');

    // Если не авторизован - блокировка функционала профиля
    if (!isAuthorized) {
        // Отключить кнопку "Редактировать"
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.style.filter = "grayscale(0.6) opacity(0.6)";
            editBtn.style.cursor = "not-allowed";
            // Перехват клика — показать сообщение
            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showProfileAuthMessage();
            });
        }
        // Отключить кнопки-загрузки аватара и обоев
        if (avatarLabel) {
            avatarLabel.style.pointerEvents = 'none';
            avatarLabel.style.filter = 'grayscale(0.6) opacity(0.7)';
            avatarLabel.title = "Только для авторизованных пользователей";
        }
        if (wallpaperLabel) {
            wallpaperLabel.style.pointerEvents = 'none';
            wallpaperLabel.style.filter = 'grayscale(0.6) opacity(0.7)';
            wallpaperLabel.title = "Только для авторизованных пользователей";
        }
        // Физически блокируем инпуты на всякий случай (безопасность)
        if (avatarInput) avatarInput.disabled = true;
        if (wallpaperInput) wallpaperInput.disabled = true;
        // Заблокировать кнопку удаления аккаунта
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.style.filter = "grayscale(0.6) opacity(0.6)";
            deleteBtn.style.cursor = "not-allowed";
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showProfileAuthMessage();
            });
        }
    }
    

    // Вспомогательная функция показа сообщения
    function showProfileAuthMessage() {
        if (document.getElementById('profile-auth-msg')) return;
        let msg = document.createElement('div');
        msg.id = 'profile-auth-msg';
        msg.innerHTML = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff; font-size:1.7rem; color:#E1749E; border-radius:16px; padding:30px 38px; box-shadow:0 0 30px #e1749e44;text-align:center;max-width:350px">
              Для взаимодействия с профилем необходимо <b>войти</b> или зарегистрироваться!
              <br>
              <button style="margin-top:20px;background:#e1749e;color:#fff;font-size:1.1em;border:none;border-radius:11px;padding:7px 25px;cursor:pointer;"
               onclick="document.getElementById('profile-auth-msg').remove()">Ок</button>
            </div>
        </div>`;
        document.body.appendChild(msg);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Находим элементы "плюсиков" на аватарке и обоях
    // Предполагается, что у "плюсика" на кнопке есть класс "plus-icon" внутри .circle_button и .back_button
    // Например:
    // <label class="circle_button"><span class="plus-icon">+</span></label>

    const profileArticle = document.getElementById('profile');
    const avatarLabel = profileArticle ? profileArticle.querySelector('.circle_button') : null;
    const wallpaperLabel = profileArticle ? profileArticle.querySelector('.back_button') : null;
    const avatarPlus = avatarLabel ? avatarLabel.querySelector('.plus-icon') : null;
    const wallpaperPlus = wallpaperLabel ? wallpaperLabel.querySelector('.plus-icon') : null;

    // Функция обновления видимости плюсика
    function updatePlusIcons(avatarSet, wallpaperSet) {
        if (avatarPlus) avatarPlus.style.display = avatarSet ? 'none' : '';
        if (wallpaperPlus) wallpaperPlus.style.display = wallpaperSet ? 'none' : '';
    }

    // Получаем текущего пользователя и его параметры
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.name === currentUser) || {};

    // При загрузке страницы сразу показываем/скрываем плюсики в зависимости от наличия аватарки/обоев
    updatePlusIcons(!!user.avatar, !!user.wallpaper);

    // Найти input для загрузки аватарки и обоев
    const avatarInput = document.getElementById('upload');
    const wallpaperInput = document.getElementById('upload_two');

    // --- Обработчик для аватарки ---
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            // Сразу спрятать плюсик (визу feedback даже до загрузки)
            if (avatarPlus) avatarPlus.style.display = 'none';
            const reader = new FileReader();
            reader.onload = function (evt) {
                // Плюсик не появляется обратно!
                if (avatarPlus) avatarPlus.style.display = 'none';

                // Сохраняем в localStorage (через основной updateUser системы)
                if (currentUser) {
                    let usersArr = JSON.parse(localStorage.getItem('users') || '[]');
                    let idx = usersArr.findIndex(u => u.name === currentUser);
                    if (idx !== -1) {
                        usersArr[idx].avatar = evt.target.result;
                        localStorage.setItem('users', JSON.stringify(usersArr));
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Обработчик для обоев ---
    if (wallpaperInput) {
        wallpaperInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            if (wallpaperPlus) wallpaperPlus.style.display = 'none';
            const reader = new FileReader();
            reader.onload = function (evt) {
                if (wallpaperPlus) wallpaperPlus.style.display = 'none';

                // Сохраняем в localStorage
                if (currentUser) {
                    let usersArr = JSON.parse(localStorage.getItem('users') || '[]');
                    let idx = usersArr.findIndex(u => u.name === currentUser);
                    if (idx !== -1) {
                        usersArr[idx].wallpaper = evt.target.result;
                        localStorage.setItem('users', JSON.stringify(usersArr));
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Элементы кнопок блока портфолио
    const largeButton = document.querySelector('.large_button');
    const miniOneButton = document.querySelector('.mini_one');
    const miniTwoButton = document.querySelector('.mini_two');
    
    // Проверка авторизации пользователя
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const isAuthorized = !!(currentUser && users.some(u => u.name === currentUser));
    
    // Сообщение если пользователь не авторизован
    function showAuthMessage() {
        if (document.getElementById('auth-msg-block')) return;
        let msg = document.createElement('div');
        msg.id = 'auth-msg-block';
        msg.innerHTML = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff; font-size:2.2rem; color:#E1749E; border-radius:19px; padding:42px 48px; box-shadow:0 0 40px #e1749e7a;max-width:400px;text-align:center">
          Сначала войдите или зарегистрируйтесь!
          <br>
          <button style="margin-top:22px;background:#e1749e;color:#fff;font-size:1.2em;border:none;border-radius:11px;padding:9px 28px;cursor:pointer;"
           onclick="document.getElementById('auth-msg-block').remove()">Ок</button>
        </div>
      </div>`;
        document.body.appendChild(msg);
    }

    // Функция для включения/отключения кнопок
    function setButtonsEnabled(enabled) {
        [largeButton, miniOneButton, miniTwoButton].forEach(btn => {
            if (!btn) return;
            btn.disabled = !enabled;
            btn.style.filter = enabled ? '' : 'grayscale(0.6) opacity(0.6)';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        });
    }
    setButtonsEnabled(isAuthorized);

    // --- 1. Если не авторизован — кнопки показывают сообщение и не работают
    if (!isAuthorized) {
        [largeButton, miniOneButton, miniTwoButton].forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                showAuthMessage();
            });
        });
        // Не навешивать другие обработчики
        return;
    }

    // ------ 2. КНОПКА "Смотреть портфолио" -----
    if (largeButton) {
        largeButton.addEventListener('click', function() {
            window.location.href = 'watch_port.html';
        });
    }

    // ------ 4. КНОПКА "Мое портфолио" -----
    if (miniTwoButton) {
        miniTwoButton.addEventListener('click', function() {
            window.location.href = 'my_portfolio.html';
        });
    }

    // ------ 3. КНОПКА "Создать портфолио" и форма ------
    if (miniOneButton) {
        miniOneButton.addEventListener('click', function() {
            // Форма создания нового портфолио
            if (document.getElementById('new-portf-modal')) return; // Уже открыта
            let modal = document.createElement('div');
            modal.id = 'new-portf-modal';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(0,0,0,0.16);display:flex;align-items:center;justify-content:center;';
            modal.innerHTML = `
            <div style="background:#fff; padding:36px 46px; border-radius:27px; max-width:525px; box-shadow:0 4px 30px #E1749E90; font-size:1.25rem; width:460px;position:relative;">
                <button id="close-portf-modal" style="position:absolute;right:20px;top:20px;font-size:1.6em;background:none;border:none;color:#E1749E;cursor:pointer;">×</button>
                <form id="portfolio-form" autocomplete="off">
                    <div style="margin-bottom:18px;">
                        <b>Название портфолио:</b><br>
                        <input name="title" type="text" required maxlength="60" style="width:100%;margin-top:5px;padding:7px 8px;font-size:1em;" />
                    </div>
                    <div style="margin-bottom:18px;">
                        <b>Описание:</b><br>
                        <textarea name="description" required maxlength="600" style="width:100%;margin-top:5px;padding:7px 8px;font-size:1em;" rows="3"></textarea>
                    </div>
                    <div style="margin-bottom:18px;">
                        <b>Ссылки:</b><br>
                        <input name="links" type="text" placeholder="Через запятую, если их несколько" style="width:100%;margin-top:5px;padding:7px 8px;font-size:1em;" />
                    </div>
                    <div style="margin-bottom:18px;">
                        <b>Добавьте фото работ:</b><br>
                        <input name="images" type="file" accept="image/*" multiple required style="margin-top:8px;" />
                        <div id="preview-images" style="margin-top:10px;display:flex;flex-direction:row;align-items:center;gap:16px;"></div>
                        <div style="margin-top:8px;display:flex;gap:10px;align-items:center;" id="carousel-controls">
                            <button type="button" id="prev-img" style="font-size:1.5em;background:#E1749E;color:#fff;border:none;border-radius:9px;width:40px;height:40px;display:none;cursor:pointer;">‹</button>
                            <button type="button" id="next-img" style="font-size:1.5em;background:#E1749E;color:#fff;border:none;border-radius:9px;width:40px;height:40px;display:none;cursor:pointer;">›</button>
                        </div>
                    </div>
                    <button type="submit" style="margin-top:15px;background:#E1749E;color:#fff;border:none;border-radius:10px;padding:11px 36px;font-size:1.1em;cursor:pointer;">
                        Создать
                    </button>
                </form>
            </div>`;
            document.body.appendChild(modal);

            // --- модальное закрытие
            modal.querySelector('#close-portf-modal').onclick = function() {
                modal.remove();
            };
            modal.onclick = function(evt) {
                if (evt.target === modal) modal.remove();
            };

            // --- Карусель предпросмотра фото-работ
            let input = modal.querySelector('input[name="images"]');
            let preview = modal.querySelector('#preview-images');
            let imgArr = [];
            let currentIdx = 0;

            function updatePreview() {
                preview.innerHTML = '';
                if (imgArr.length === 0) return;
                let img = document.createElement('img');
                img.src = imgArr[currentIdx];
                img.style.maxWidth = '220px';
                img.style.maxHeight = '160px';
                img.style.borderRadius = '10px';
                img.style.boxShadow = '0 2px 12px #e1749e33';
                preview.appendChild(img);
                // Обновить видимость кнопок
                prevBtn.style.display = imgArr.length > 1 ? '' : 'none';
                nextBtn.style.display = imgArr.length > 1 ? '' : 'none';
            }

            const prevBtn = modal.querySelector('#prev-img');
            const nextBtn = modal.querySelector('#next-img');
            prevBtn.addEventListener('click', function() {
                if (!imgArr.length) return;
                currentIdx = (currentIdx - 1 + imgArr.length) % imgArr.length;
                updatePreview();
            });
            nextBtn.addEventListener('click', function() {
                if (!imgArr.length) return;
                currentIdx = (currentIdx + 1) % imgArr.length;
                updatePreview();
            });

            // --- Когда пользователь выбирает изображения
            input.addEventListener('change', function(e) {
                const files = Array.from(input.files);
                imgArr = [];
                if (files.length) {
                    let count = files.length;
                    let loaded = 0;
                    files.forEach(function(file, idx) {
                        let reader = new FileReader();
                        reader.onload = function(ev) {
                            imgArr[idx] = ev.target.result;
                            loaded++;
                            if (loaded === count) {
                                currentIdx = 0;
                                updatePreview();
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                } else {
                    updatePreview();
                }
            });

            // --- Обработка формы создания портфолио
            modal.querySelector('#portfolio-form').addEventListener('submit', function(e) {
                e.preventDefault();
                // Данные формы
                const fd = new FormData(e.target);
                const title = fd.get('title').trim();
                const description = fd.get('description').trim();
                const links = (fd.get('links') || '').trim();
                // Изображения
                if (imgArr.length === 0) {
                    alert('Добавьте хотя бы одно фото');
                    return;
                }
                // Структура портфолио
                const newPortfolio = {
                    user: currentUser,
                    title,
                    description,
                    links: links,
                    images: imgArr,
                    created: Date.now()
                };

                // Сохраняем в localStorage в массив portfolios[]
                let portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
                portfolios.push(newPortfolio);
                localStorage.setItem('portfolios', JSON.stringify(portfolios));

                modal.remove();
                showSuccessMsg();
            });

            // Подтверждение
            function showSuccessMsg() {
                let okmsg = document.createElement('div');
                okmsg.innerHTML = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;">
                  <div style="background:#fff; font-size:1.5rem; color:#E1749E; border-radius:18px; padding:30px 42px; box-shadow:0 0 30px #e1749e4c;max-width:350px; text-align:center;">
                    Портфолио создано!<br>
                    <button style="margin-top:18px;background:#e1749e;color:#fff;font-size:1.1em;border:none;border-radius:11px;padding:7px 22px;cursor:pointer;"
                     onclick="this.closest('div[style*=&quot;position:fixed&quot;]').remove()">Ок</button>
                  </div>
                </div>`;
                document.body.appendChild(okmsg);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const profileArticle = document.getElementById('profile');
    if (!profileArticle) return;

    // Проверка наличия, чтобы не дублировать
    if (profileArticle.querySelector('#delete-account-btn')) return;

    // Создаем кнопку и добавляем в конец профиля
    const delBtn = document.createElement('button');
    delBtn.id = 'delete-account-btn';
    delBtn.textContent = 'Удалить аккаунт';
    delBtn.style.cssText = `
        margin-top: 22px; 
        background: #fff0f7;
        color: #e1749e; 
        border: 2px solid #e1749e; 
        border-radius: 13px; 
        font-size: 1em; 
        padding: 8px 32px; 
        cursor: pointer; 
        display: block;`;

    // Добавить кнопку перед закрывающим тегом article, найдем место после .edit_profile_btn
    const editBtn = profileArticle.querySelector('.edit_profile_btn');
    if (editBtn) {
        editBtn.insertAdjacentElement('afterend', delBtn);
    } else {
        profileArticle.appendChild(delBtn);
    }

    delBtn.addEventListener('click', function () {
        // Подтверждение удаления
        if (!confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!')) return;

        // Получить текущего пользователя и пользователей из localStorage
        const currentUser = localStorage.getItem('currentUser');
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.name !== currentUser);
        localStorage.setItem('users', JSON.stringify(users));
        // Удаляем все портфолио этого пользователя (если требуется)
        let portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
        portfolios = portfolios.filter(p => p.user !== currentUser);
        localStorage.setItem('portfolios', JSON.stringify(portfolios));
        // Удалить имя текущего пользователя
        localStorage.removeItem('currentUser');
        // Сообщение и редирект (обновить страницу, перейти на главную или на login)
        alert('Ваш аккаунт успешно удалён.');
        window.location.href = 'index.html';
    });
    
});
