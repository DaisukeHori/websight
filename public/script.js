// AOSアニメーション初期化
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

document.addEventListener('DOMContentLoaded', () => {
    // フォームバリデーションの初期化
    initFormValidation();
    
    // ナビゲーションの制御
    initNavigation();
});

// フォームバリデーションの初期化
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
                handleFormSubmission(form);
            }
            form.classList.add('was-validated');
        });
    });
}

// フォーム送信処理
function handleFormSubmission(form) {
    // フォームデータの収集
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    // 成功メッセージの表示
    showFormMessage(form, 'お問い合わせありがとうございます。内容を確認の上、担当者よりご連絡させていただきます。', 'success');
    
    // フォームのリセット
    form.reset();
    form.classList.remove('was-validated');
}

// フォームメッセージの表示
function showFormMessage(form, message, type = 'success') {
    // 既存のメッセージを削除
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 新しいメッセージを作成
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-4`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // メッセージの挿入
    form.parentNode.insertBefore(alertDiv, form.nextSibling);

    // 3秒後に自動で消える
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// ナビゲーションの制御
function initNavigation() {
    // スムーズスクロール
    initSmoothScroll();
    
    // アクティブなナビゲーションアイテムの制御
    initActiveNavigation();
    
    // モバイルメニューの自動収納
    initMobileMenuCollapse();
}

// スムーズスクロール
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// アクティブなナビゲーションアイテムの制御
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.navbar-nav .nav-link');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navItems.forEach(navItem => {
                    navItem.classList.remove('active');
                    if (navItem.getAttribute('href') === `#${section.id}`) {
                        navItem.classList.add('active');
                    }
                });
            }
        });
    });
}

// モバイルメニューの自動収納
function initMobileMenuCollapse() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarCollapse) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }
}

// スクロール位置に応じたナビゲーションの背景色変更
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});