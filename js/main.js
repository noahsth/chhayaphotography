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
            
            // Refresh AOS animations for filtered items
            AOS.refresh();
            
            // Scroll to filter nav container
            const filterNav = document.getElementById('filter-nav');
            filterNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Contact form submission handling with Formspree
document.querySelectorAll('#contact-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('#submit-btn');
        const formMessage = form.querySelector('#form-message');
        const messageText = form.querySelector('#message-text');
        const originalBtnText = submitBtn.innerHTML;
        
        // Get all form fields
        const firstName = form.querySelector('input[name="firstName"]')?.value.trim() || '';
        const lastName = form.querySelector('input[name="lastName"]')?.value.trim() || '';
        const email = form.querySelector('input[name="email"]')?.value.trim() || '';
        const service = form.querySelector('select[name="service"]')?.value.trim() || '';
        const message = form.querySelector('textarea[name="message"]')?.value.trim() || '';
        
        console.log('Form validation:', {
            firstName: firstName ? 'yes' : 'no',
            lastName: lastName ? 'yes' : 'no',
            email: email ? 'yes' : 'no',
            service: service ? 'yes' : 'no',
            message: message ? 'yes' : 'no'
        });
        
        // Validate all required fields
        if (!firstName || !lastName || !email || !service || !message) {
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Please fill in all required fields (First Name, Last Name, Email, Service, and Message).';
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Please enter a valid email address.';
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        
        // Create FormData
        const formData = new FormData(form);
        
        // Send to Formspree
        fetch('https://formspree.io/f/mwvonevl', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            console.log('Response data:', result);
            
            formMessage.classList.remove('hidden');
            
            // Check if response is successful (status 200 or data.ok = true)
            if (result.status === 200 || result.data.ok) {
                formMessage.classList.remove('bg-red-50', 'text-red-700');
                formMessage.classList.add('bg-green-50', 'text-green-700');
                messageText.textContent = 'Thank you! Your message has been sent successfully. We will get back to you soon.';
                
                // Reset form after success
                form.reset();
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            } else {
                formMessage.classList.remove('bg-green-50', 'text-green-700');
                formMessage.classList.add('bg-red-50', 'text-red-700');
                messageText.textContent = 'Error sending message. Please try again or contact us directly.';
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Connection error. Please check your internet and try again.';
            
            // Re-enable submit button on error
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });
});

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

// Contact form submission handling with Formspree
document.querySelectorAll('#contact-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('#submit-btn');
        const formMessage = form.querySelector('#form-message');
        const messageText = form.querySelector('#message-text');
        const originalBtnText = submitBtn.innerHTML;
        
        // Get all form fields
        const firstName = form.querySelector('input[name="firstName"]')?.value.trim() || '';
        const lastName = form.querySelector('input[name="lastName"]')?.value.trim() || '';
        const email = form.querySelector('input[name="email"]')?.value.trim() || '';
        const service = form.querySelector('select[name="service"]')?.value.trim() || '';
        const message = form.querySelector('textarea[name="message"]')?.value.trim() || '';
        
        console.log('Form validation:', {
            firstName: firstName ? 'yes' : 'no',
            lastName: lastName ? 'yes' : 'no',
            email: email ? 'yes' : 'no',
            service: service ? 'yes' : 'no',
            message: message ? 'yes' : 'no'
        });
        
        // Validate all required fields
        if (!firstName || !lastName || !email || !service || !message) {
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Please fill in all required fields (First Name, Last Name, Email, Service, and Message).';
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Please enter a valid email address.';
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        
        // Create FormData
        const formData = new FormData(form);
        
        // Send to Formspree
        fetch('https://formspree.io/f/mwvonevl', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            console.log('Response data:', result);
            
            formMessage.classList.remove('hidden');
            
            // Check if response is successful (status 200 or data.ok = true)
            if (result.status === 200 || result.data.ok) {
                formMessage.classList.remove('bg-red-50', 'text-red-700');
                formMessage.classList.add('bg-green-50', 'text-green-700');
                messageText.textContent = 'Thank you! Your message has been sent successfully. We will get back to you soon.';
                
                // Reset form after success
                form.reset();
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            } else {
                formMessage.classList.remove('bg-green-50', 'text-green-700');
                formMessage.classList.add('bg-red-50', 'text-red-700');
                messageText.textContent = 'Error sending message. Please try again or contact us directly.';
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            formMessage.classList.remove('hidden', 'bg-green-50', 'text-green-700');
            formMessage.classList.add('bg-red-50', 'text-red-700');
            messageText.textContent = 'Connection error. Please check your internet and try again.';
            
            // Re-enable submit button on error
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });
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


// Phone Number Formating
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone-input');

    // Only run the code if the phone input actually exists on the current page
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); 
            value = value.substring(0, 10);
            
            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = '(' + value.substring(0, 3);
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(3, 6);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(6, 10);
                }
            }
            e.target.value = formattedValue;
        });
    }
});