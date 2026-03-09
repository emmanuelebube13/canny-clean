document.addEventListener('DOMContentLoaded', () => {
    // ======================================================================
    // Utility Functions
    // ======================================================================

    /**
     * Debounce function to limit the rate at which a function can fire.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The number of milliseconds to delay.
     * @param {boolean} immediate - Whether to invoke the function immediately.
     * @returns {Function} The debounced function.
     */
    function debounce(func, wait = 10, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Throttle function to limit the rate at which a function can fire.
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The number of milliseconds to throttle invocations to.
     * @returns {Function} The throttled function.
     */
    function throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Smooth scroll to a target element.
     * @param {string|Element} target - The target selector or element.
     * @param {number} duration - The duration of the scroll in ms.
     */
    function smoothScrollTo(target, duration = 500) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // ======================================================================
    // Classes for Modular Components
    // ======================================================================

    /**
     * Carousel Class for sliders like before-after and testimonials (on mobile).
     */
    class Carousel {
        constructor(containerSelector, options = {}) {
            this.container = document.querySelector(containerSelector);
            if (!this.container) return;

            this.slides = this.container.querySelectorAll('.slide') || this.container.querySelectorAll('.testimonial');
            this.currentIndex = 0;
            this.totalSlides = this.slides.length;
            this.autoPlayInterval = null;
            this.touchStartX = 0;
            this.touchEndX = 0;

            this.options = {
                autoPlay: true,
                autoPlaySpeed: 5000,
                arrows: true,
                dots: true,
                infinite: true,
                touch: true,
                ...options
            };

            this.init();
        }

        init() {
            this.setupStructure();
            this.setupEvents();
            this.updateSlide();
            if (this.options.autoPlay) this.startAutoPlay();
        }

        setupStructure() {
            // Wrap slides in a inner container for sliding
            const inner = document.createElement('div');
            inner.classList.add('carousel-inner');
            this.slides.forEach(slide => inner.appendChild(slide));
            this.container.appendChild(inner);
            this.inner = inner;

            // Add arrows if enabled
            if (this.options.arrows) {
                const prev = document.createElement('button');
                prev.classList.add('carousel-arrow', 'prev');
                prev.innerHTML = '&lt;';
                prev.setAttribute('aria-label', 'Previous Slide');

                const next = document.createElement('button');
                next.classList.add('carousel-arrow', 'next');
                next.innerHTML = '&gt;';
                next.setAttribute('aria-label', 'Next Slide');

                this.container.appendChild(prev);
                this.container.appendChild(next);

                this.prevArrow = prev;
                this.nextArrow = next;
            }

            // Add dots if enabled
            if (this.options.dots) {
                const dotsContainer = document.createElement('div');
                dotsContainer.classList.add('carousel-dots');
                for (let i = 0; i < this.totalSlides; i++) {
                    const dot = document.createElement('button');
                    dot.classList.add('carousel-dot');
                    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    dot.dataset.index = i;
                    dotsContainer.appendChild(dot);
                }
                this.container.appendChild(dotsContainer);
                this.dots = dotsContainer.querySelectorAll('.carousel-dot');
            }
        }

        setupEvents() {
            if (this.options.arrows) {
                this.prevArrow.addEventListener('click', () => this.prev());
                this.nextArrow.addEventListener('click', () => this.next());
            }

            if (this.options.dots) {
                this.dots.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        this.goTo(parseInt(e.target.dataset.index));
                    });
                });
            }

            if (this.options.touch) {
                this.inner.addEventListener('touchstart', (e) => {
                    this.touchStartX = e.changedTouches[0].screenX;
                });

                this.inner.addEventListener('touchend', (e) => {
                    this.touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe();
                });
            }

            // Pause autoPlay on hover
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());

            // Keyboard navigation
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });

            // Resize handler to recalculate slide width
            window.addEventListener('resize', debounce(() => this.updateSlide(), 200));
        }

        handleSwipe() {
            if (this.touchEndX < this.touchStartX - 50) this.next();
            if (this.touchEndX > this.touchStartX + 50) this.prev();
        }

        updateSlide() {
            const slideWidth = this.slides[0].offsetWidth;
            this.inner.style.transition = 'transform 0.5s ease';
            this.inner.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;

            if (this.options.dots) {
                this.dots.forEach(dot => dot.classList.remove('active'));
                this.dots[this.currentIndex].classList.add('active');
            }
        }

        goTo(index) {
            if (index < 0) index = this.options.infinite ? this.totalSlides - 1 : 0;
            if (index >= this.totalSlides) index = this.options.infinite ? 0 : this.totalSlides - 1;
            this.currentIndex = index;
            this.updateSlide();
        }

        next() {
            this.goTo(this.currentIndex + 1);
        }

        prev() {
            this.goTo(this.currentIndex - 1);
        }

        startAutoPlay() {
            if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = setInterval(() => this.next(), this.options.autoPlaySpeed);
        }

        stopAutoPlay() {
            if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        }
    }

    /**
     * Accordion Class for FAQ sections.
     */
    class Accordion {
        constructor(containerSelector) {
            this.container = document.querySelector(containerSelector);
            if (!this.container) return;

            this.items = this.container.querySelectorAll('.faq-item');
            this.init();
        }

        init() {
            this.items.forEach(item => {
                const header = item.querySelector('h3');
                const content = item.querySelector('p');
                if (!header || !content) return;

                // Set ARIA attributes
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
                header.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
                content.style.display = 'none';

                // Click handler
                header.addEventListener('click', () => this.toggle(item));

                // Keyboard handler
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle(item);
                    }
                });
            });
        }

        toggle(item) {
            const header = item.querySelector('h3');
            const content = item.querySelector('p');
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Close others (optional, for single open)
            this.items.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherHeader = otherItem.querySelector('h3');
                    const otherContent = otherItem.querySelector('p');
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherContent.setAttribute('aria-hidden', 'true');
                    otherContent.style.display = 'none';
                }
            });

            header.setAttribute('aria-expanded', !isExpanded);
            content.setAttribute('aria-hidden', isExpanded);
            content.style.display = isExpanded ? 'none' : 'block';
        }
    }

    /**
     * Lightbox Class for gallery images.
     */
    class Lightbox {
        constructor(triggerSelector, lightboxId) {
            this.triggers = document.querySelectorAll(triggerSelector);
            this.lightbox = document.querySelector(lightboxId);
            if (!this.lightbox || this.triggers.length === 0) return;

            this.img = this.lightbox.querySelector('#lightbox-img');
            this.close = this.lightbox.querySelector('#lightbox-close');
            this.currentIndex = 0;

            this.init();
        }

        init() {
            this.triggers.forEach((trigger, index) => {
                trigger.addEventListener('click', () => this.open(index));
                trigger.setAttribute('role', 'button');
                trigger.setAttribute('tabindex', '0');
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this.open(index);
                });
            });

            this.close.addEventListener('click', () => this.closeLightbox());

            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) this.closeLightbox();
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (this.lightbox.style.display !== 'flex') return;
                if (e.key === 'Escape') this.closeLightbox();
                if (e.key === 'ArrowRight') this.next();
                if (e.key === 'ArrowLeft') this.prev();
            });

            // Swipe support
            this.lightbox.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });

            this.lightbox.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                if (this.touchEndX < this.touchStartX - 50) this.next();
                if (this.touchEndX > this.touchStartX + 50) this.prev();
            });
        }

        open(index) {
            this.currentIndex = index;
            this.updateImage();
            this.lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            this.lightbox.focus(); // For accessibility
        }

        closeLightbox() {
            this.lightbox.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }

        updateImage() {
            this.img.src = this.triggers[this.currentIndex].src;
            this.img.alt = this.triggers[this.currentIndex].alt;
        }

        next() {
            this.currentIndex = (this.currentIndex + 1) % this.triggers.length;
            this.updateImage();
        }

        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.triggers.length) % this.triggers.length;
            this.updateImage();
        }
    }

    /**
     * FormHandler Class for contact and booking forms.
     */
    class FormHandler {
        constructor(formId) {
            this.form = document.querySelector(formId);
            if (!this.form) return;

            this.fields = this.form.querySelectorAll('input[required], select[required], textarea[required]');
            this.submitButton = this.form.querySelector('button[type="submit"]');
            this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Real-time validation
            this.fields.forEach(field => {
                field.addEventListener('input', () => this.validateField(field));
                field.addEventListener('blur', () => this.validateField(field));
            });
        }

        validateField(field) {
            let valid = true;
            const type = field.type;
            const value = field.value.trim();

            if (field.required && !value) valid = false;

            if (type === 'email' && value && !this.isValidEmail(value)) valid = false;
            if (type === 'tel' && value && !this.isValidPhone(value)) valid = false;

            if (valid) {
                field.classList.remove('invalid');
                field.setAttribute('aria-invalid', 'false');
            } else {
                field.classList.add('invalid');
                field.setAttribute('aria-invalid', 'true');
            }

            return valid;
        }

        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        isValidPhone(phone) {
            const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            return re.test(phone);
        }

        validateForm() {
            let valid = true;
            this.fields.forEach(field => {
                if (!this.validateField(field)) valid = false;
            });
            return valid;
        }

        handleSubmit(e) {
            e.preventDefault();
            if (!this.validateForm()) {
                alert('Please fill out all required fields correctly.');
                return;
            }

            // Placeholder submission
            alert('Form submitted successfully! We will contact you soon.');
            this.form.reset();

            // For production: Use fetch to send to backend
            /*
            const formData = new FormData(this.form);
            fetch('/api/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Submitted!');
                    this.form.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('An error occurred. Please try again.');
            });
            */
        }
    }

    // ======================================================================
    // Initialization of Components
    // ======================================================================

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Fade-in Animations
    const faders = document.querySelectorAll('.fade-in, .service-card, .testimonial, .faq-item');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));

    // Carousels
    if (document.querySelector('.gallery-slider')) {
        new Carousel('.gallery-slider', { autoPlaySpeed: 4000 });
    }

    // Conditional Testimonial Carousel: Slider on mobile, grid on desktop
    const testimonialGrid = document.querySelector('.testimonial-grid');
    if (testimonialGrid) {
        function setupTestimonialView() {
            if (window.innerWidth < 768) {
                // Make slider
                testimonialGrid.classList.add('carousel-inner');
                new Carousel('.testimonials', { dots: false, arrows: false });
            } else {
                // Remove slider classes
                testimonialGrid.classList.remove('carousel-inner');
                testimonialGrid.style.transform = '';
            }
        }
        setupTestimonialView();
        window.addEventListener('resize', debounce(setupTestimonialView, 200));
    }

    // Accordion for FAQ
    if (document.querySelector('.faq-container')) {
        new Accordion('.faq-container');
    }

    // Lightbox for Gallery
    if (document.querySelector('#lightbox')) {
        new Lightbox('.gallery-item img', '#lightbox');
    }

    // Form Handlers
    if (document.querySelector('#booking-form')) {
        new FormHandler('#booking-form');
    }
    if (document.querySelector('#contact-form')) {
        new FormHandler('#contact-form');
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            smoothScrollTo(targetId, 800);
        });
    });

    // Scroll Effects: Sticky Header, Back to Top, Parallax
    const header = document.querySelector('.main-header');
    const backToTop = document.querySelector('.back-to-top');
    const floatingCta = document.querySelector('.floating-cta');
    const heroImage = document.querySelector('.hero-image');
    const scrollTrigger = 200;

    if (header || backToTop || heroImage || floatingCta) {
        const handleScroll = throttle(() => {
            const scrolled = window.scrollY;

            // Sticky Header
            if (header) {
                header.classList.toggle('scrolled', scrolled > 0);
            }

            // Back to Top
            if (backToTop) {
                backToTop.style.display = scrolled > scrollTrigger ? 'block' : 'none';
            }

            // Floating CTA animation (subtle bounce on appear)
            if (floatingCta && scrolled > scrollTrigger) {
                floatingCta.classList.add('visible');
            } else if (floatingCta) {
                floatingCta.classList.remove('visible');
            }

            // Hero Parallax
            if (heroImage && scrolled < window.innerHeight) {
                const speed = 0.2;
                const yPos = scrolled * speed;
                heroImage.style.transform = `translateY(${yPos}px)`;
            }
        }, 20);

        window.addEventListener('scroll', handleScroll);
    }

    // Back to Top Click
    if (backToTop) {
        backToTop.addEventListener('click', () => smoothScrollTo(0, 1000));
    }

    // Lazy Loading Fallback for Images (if not supported)
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    lazyObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => lazyObserver.observe(img));
    }

    // Error Handling: Global error listener (for production logging)
    window.addEventListener('error', (e) => {
        console.error('Global Error:', e.message);
        // In production: send to analytics or server
    });

    // Performance: Remove event listeners on unload (optional)
    window.addEventListener('beforeunload', () => {
        // Cleanup if needed
    });

    // Accessibility: Focus management for modals/lightbox
    // Already handled in classes

    // Analytics Placeholder (for company grade)
    // function trackEvent(category, action, label) {
    //     // Integrate with GA or similar
    //     console.log(`Event: ${category} - ${action} - ${label}`);
    // }
    // Example: trackEvent('Form', 'Submit', 'Booking');

    // More features can be added as needed...
});