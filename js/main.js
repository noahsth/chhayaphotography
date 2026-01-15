// Main JavaScript for Chhaya Photography Modern Website

// Initialize AOS (Animate On Scroll) - Optimized for performance
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 50,
        disable: false,
        anchorPlacement: 'top-bottom',
        debounceDelay: 50,
        throttleDelay: 99
    });
});

// Throttle function for performance optimization
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// Navbar Scroll Effect - Optimized with throttling and passive listener
const handleScroll = throttle(function() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    
    if (window.scrollY > 100) {
        navbar.classList.add('navbar-scrolled');
        if (backToTop) backToTop.classList.add('show');
    } else {
        navbar.classList.remove('navbar-scrolled');
        if (backToTop) backToTop.classList.remove('show');
    }
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        
        // Animate icon
        const icon = this.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Portfolio Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-red-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-800');
            });
            
            // Add active class to clicked button
            this.classList.remove('bg-gray-200', 'text-gray-800');
            this.classList.add('active', 'bg-red-600', 'text-white');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    // Re-trigger animation
                    item.style.animation = 'none';
                    setTimeout(() => {
                        item.style.animation = 'fadeInUp 0.6s ease forwards';
                    }, 10);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Image Lazy Loading
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.setAttribute('data-loaded', 'true');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => {
    img.setAttribute('data-loaded', 'false');
    imageObserver.observe(img);
});

// Portfolio Image Lightbox
const portfolioImages = document.querySelectorAll('.portfolio-item');
let lightbox = null;

// Create lightbox element
function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="absolute top-8 right-8 text-white text-4xl z-10 hover:text-red-600 transition-colors" id="close-lightbox">
            <i class="fas fa-times"></i>
        </button>
        <img src="" alt="Lightbox Image" class="lightbox-image">
        <button class="absolute left-8 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-red-600 transition-colors" id="prev-image">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="absolute right-8 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-red-600 transition-colors" id="next-image">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    document.body.appendChild(lightbox);
    
    // Close lightbox
    document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateImage(-1);
        } else if (e.key === 'ArrowRight') {
            navigateImage(1);
        }
    });
    
    // Navigation buttons
    document.getElementById('prev-image').addEventListener('click', () => navigateImage(-1));
    document.getElementById('next-image').addEventListener('click', () => navigateImage(1));
}

let currentImageIndex = 0;
const imageArray = Array.from(portfolioImages);

portfolioImages.forEach((item, index) => {
    item.addEventListener('click', function() {
        if (!lightbox) {
            createLightbox();
        }
        
        currentImageIndex = index;
        const img = this.querySelector('img');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function navigateImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = imageArray.length - 1;
    } else if (currentImageIndex >= imageArray.length) {
        currentImageIndex = 0;
    }
    
    const img = imageArray[currentImageIndex].querySelector('img');
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    lightboxImg.src = img.src;
}

// Form Validation and Submission
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        let isValid = true;
        const inputs = this.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
            } else {
                input.classList.remove('border-red-500');
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Show success message (in production, send to server)
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
        
        // In production, you would send data to server:
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // }).then(response => response.json())
        //   .then(data => {
        //       // Handle success
        //   });
    });
}

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-red-600', 'font-semibold');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('text-red-600', 'font-semibold');
        }
    });
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const heroSection = document.querySelector('#home .hero-image');
    if (heroSection) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroSection.style.transform = `translateY(${parallax}px) scale(1.1)`;
    }
});

// Counter Animation for Statistics
const counters = document.querySelectorAll('.text-4xl');
const speed = 200; // Animation speed

const animateCounter = (counter) => {
    const target = +counter.innerText.replace(/\+/g, '');
    const increment = target / speed;
    let count = 0;
    
    const updateCount = () => {
        if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count) + '+';
            setTimeout(updateCount, 10);
        } else {
            counter.innerText = target + '+';
        }
    };
    
    updateCount();
};

// Observe counters and animate when in viewport
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            if (!counter.dataset.animated) {
                animateCounter(counter);
                counter.dataset.animated = 'true';
            }
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    if (counter.innerText.includes('+')) {
        counterObserver.observe(counter);
    }
});

// Loading Screen (Optional)
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Console Message
console.log('%c🎨 Chhaya Photography', 'font-size: 20px; font-weight: bold; color: #8B1538;');
console.log('%cWebsite designed with ❤️', 'font-size: 14px; color: #666;');

// Prevent right-click on images (optional, for image protection)
// Uncomment if needed
// document.querySelectorAll('img').forEach(img => {
//     img.addEventListener('contextmenu', e => e.preventDefault());
// });

// Performance Optimization - Lazy loading and will-change cleanup
if ('IntersectionObserver' in window) {
    window.addEventListener('load', function() {
        // Add lazy loading attributes to portfolio images
        const portfolioImages = document.querySelectorAll('.portfolio-item img, .gallery-item img');
        portfolioImages.forEach(img => {
            if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'eager') {
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
            }
        });
        
        // Clean up will-change property for better performance
        const cleanupObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                if (entry.isIntersecting) {
                    element.style.willChange = 'transform, opacity';
                } else {
                    setTimeout(() => {
                        element.style.willChange = 'auto';
                    }, 500);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '50px'
        });
        
        document.querySelectorAll('.portfolio-item, .gallery-item, [data-aos]').forEach(item => {
            cleanupObserver.observe(item);
        });
    });
}
// Performance Optimization - Lazy loading and will-change cleanup
if ('IntersectionObserver' in window) {
    window.addEventListener('load', function() {
        // Add lazy loading attributes to portfolio images
        const portfolioImages = document.querySelectorAll('.portfolio-item img, .gallery-item img');
        portfolioImages.forEach(img => {
            if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'eager') {
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
            }
        });
        
        // Clean up will-change property for better performance
        const cleanupObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                if (entry.isIntersecting) {
                    element.style.willChange = 'transform, opacity';
                } else {
                    setTimeout(() => {
                        element.style.willChange = 'auto';
                    }, 500);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '50px'
        });
        
        document.querySelectorAll('.portfolio-item, .gallery-item, [data-aos]').forEach(item => {
            cleanupObserver.observe(item);
        });
    });
}
