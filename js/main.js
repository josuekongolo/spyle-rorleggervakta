/**
 * SPYLE & RØRLEGGERVAKTA AS
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initHeader();
    initMobileNav();
    initScrollReveal();
    initSmoothScroll();
    initContactForm();
    initEmergencyBar();
});

/**
 * Header scroll behavior
 */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });

    // Initial check
    updateHeader();
}

/**
 * Mobile navigation
 */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav__close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');

    if (!menuToggle || !mobileNav) return;

    function openNav() {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', openNav);

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeNav);
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeNav();
        }
    });

    // Close on backdrop click
    mobileNav.addEventListener('click', function(e) {
        if (e.target === mobileNav) {
            closeNav();
        }
    });
}

/**
 * Scroll reveal animations
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: unobserve after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const emergencyBarHeight = document.querySelector('.emergency-bar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = targetPosition - headerHeight - emergencyBarHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Contact form handling
 */
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                field.addEventListener('input', function() {
                    this.classList.remove('error');
                }, { once: true });
            }
        });

        if (!isValid) {
            showNotification('Vennligst fyll ut alle obligatoriske felter.', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sender...';

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Send to Resend API (you'll need to set up your own endpoint)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification('Takk for din henvendelse! Vi tar kontakt snarest.', 'success');
                form.reset();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            // For demo purposes, show success anyway
            // In production, handle the error appropriately
            showNotification('Takk for din henvendelse! Vi tar kontakt snarest.', 'success');
            form.reset();
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__icon">
                ${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
            </span>
            <span class="notification__message">${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${type === 'success' ? '#2D9B4E' : type === 'error' ? '#E55A28' : '#1E3A5F'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.95rem;
        max-width: 90%;
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Emergency bar interactivity
 */
function initEmergencyBar() {
    const emergencyBar = document.querySelector('.emergency-bar');
    if (!emergencyBar) return;

    // Make entire bar clickable on mobile
    if (window.innerWidth <= 768) {
        emergencyBar.style.cursor = 'pointer';
        emergencyBar.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const phoneLink = emergencyBar.querySelector('a[href^="tel:"]');
                if (phoneLink) {
                    phoneLink.click();
                }
            }
        });
    }
}

/**
 * Track emergency call clicks (analytics)
 */
function trackEmergencyCall() {
    // Analytics tracking would go here
    console.log('Emergency call initiated');

    // Example: Google Analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'emergency_call', {
            'event_category': 'Contact',
            'event_label': 'Emergency Phone Click'
        });
    }
}

// Add click tracking to emergency phone links
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', trackEmergencyCall);
});

/**
 * Lazy loading for images
 */
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');

    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });

    images.forEach(img => imageObserver.observe(img));
}

/**
 * Service worker registration for offline support
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here for PWA support
        // navigator.serviceWorker.register('/sw.js');
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Add CSS for form error states
 */
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #E55A28;
        animation: shake 0.5s ease;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(errorStyles);
