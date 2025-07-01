// Мобильное меню
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Закрытие мобильного меню при клике на ссылку
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Учитываем высоту навбара
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Наблюдение за элементами для анимации
const animateElements = document.querySelectorAll('.service-card, .team-card, .stat, .hero-card, .contact-card');
animateElements.forEach(el => observer.observe(el));

// Изменение навбара при скролле
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Анимация счетчиков
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 60; // Анимация 1 секунда (60 кадров)
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        // Запуск анимации только когда элемент виден
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counterObserver.observe(counter);
    });
}

// Запуск анимации счетчиков
animateCounters();

// Обработка формы записи на прием
const appointmentForm = document.getElementById('appointmentForm');

appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Получение данных формы
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Валидация
    if (!validateForm(data)) {
        return;
    }
    
    // Показ загрузки
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Имитация отправки (здесь должен быть реальный запрос на сервер)
    setTimeout(() => {
        showMessage('success', 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Валидация формы
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Введите корректный номер телефона');
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Введите корректный email');
    }
    
    if (!data.service) {
        errors.push('Выберите услугу');
    }
    
    if (errors.length > 0) {
        showMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Валидация телефона
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[7|8][\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Показ сообщений
function showMessage(type, message) {
    // Удаляем предыдущие сообщения
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Создаем новое сообщение
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-${type}`;
    messageDiv.innerHTML = message;
    
    // Вставляем сообщение перед формой
    const form = document.getElementById('appointmentForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Автоматическое удаление сообщения через 5 секунд
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
    
    // Прокрутка к сообщению
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Маска для телефона
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '8') {
                value = '7' + value.slice(1);
            }
            
            if (value.length <= 11) {
                value = value.replace(/(\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
            }
        }
        
        e.target.value = value;
    });
}

// Активная ссылка в навигации
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Обновление активной ссылки при скролле
window.addEventListener('scroll', updateActiveNavLink);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
    
    // Добавление класса для CSS анимаций
    document.body.classList.add('loaded');
    
    // Предзагрузка критических элементов
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.opacity = '1';
    }
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Ошибка на странице:', e.error);
});

// Плавное появление элементов при скролле (дополнительная анимация)
const revealElements = document.querySelectorAll('.service-card, .team-card, .about-features .feature');

function revealOnScroll() {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('reveal');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Инициализация reveal анимации
document.addEventListener('DOMContentLoaded', () => {
    revealOnScroll();
});

// Дополнительные CSS классы для анимаций
const style = document.createElement('style');
style.textContent = `
    .reveal {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: all 0.6s ease-out;
    }
    
    .service-card,
    .team-card,
    .about-features .feature {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease-out;
    }
    
    .nav-link.active {
        color: var(--primary-color) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
    
    .form-message {
        margin-bottom: 1.5rem;
        padding: 15px;
        border-radius: 8px;
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);