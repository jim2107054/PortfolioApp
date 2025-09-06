const API_BASE = 'https://localhost:7156/api'; // Update this to your backend URL

// Navigation and scrolling
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinksContainer = document.getElementById('navLinks');

    // Mobile and touch optimization
    function initializeTouchOptimizations() {
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('.cta-button, .submit-btn, .admin-toggle, .social-link');
        buttons.forEach(button => {
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.click();
            });
        });

        // Improve touch scrolling on mobile
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }

        // Handle viewport changes (mobile keyboard, orientation)
        let initialViewportHeight = window.innerHeight;
        
        function handleViewportChange() {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // If height decreased significantly, likely a keyboard is open
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        }

        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                initialViewportHeight = window.innerHeight;
                handleViewportChange();
            }, 500);
        });
    }

    // Enhanced mobile menu functionality
    function initializeMobileMenu() {
        let isMenuOpen = false;

        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            mobileMenuToggle.classList.toggle('active', isMenuOpen);
            navLinksContainer.classList.toggle('active', isMenuOpen);
            
            // Prevent body scroll when menu is open
            if (isMenuOpen) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                // Store scroll position
                document.body.dataset.scrollY = window.scrollY;
                document.body.style.top = `-${window.scrollY}px`;
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                // Restore scroll position
                const scrollY = document.body.dataset.scrollY;
                document.body.style.top = '';
                window.scrollTo(0, parseInt(scrollY || '0', 10));
            }
        }

        function closeMenu() {
            if (isMenuOpen) {
                toggleMenu();
            }
        }

        // Click handlers
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navLinksContainer.contains(e.target)) {
                closeMenu();
            }
        });

        // Touch handlers for mobile
        let touchStartY = 0;
        let touchStartX = 0;

        navLinksContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        });

        navLinksContainer.addEventListener('touchmove', (e) => {
            if (!isMenuOpen) return;
            
            const touchY = e.touches[0].clientY;
            const touchX = e.touches[0].clientX;
            const deltaY = touchY - touchStartY;
            const deltaX = touchX - touchStartX;

            // Prevent scrolling when menu is open
            e.preventDefault();

            // Close menu on swipe right
            if (deltaX > 100 && Math.abs(deltaY) < 50) {
                closeMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(closeMenu, 100);
        });
    }

    // Enhanced smooth scrolling for navigation links
    function initializeSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    scrollToSection(targetSection);
                }
            });
        });

        // Handle CTA button click
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = ctaButton.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    scrollToSection(targetSection);
                }
            });
        }
    }

    function scrollToSection(targetSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight + 10;
        
        // Use different scroll methods based on browser support
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            smoothScrollTo(targetPosition, 800);
        }
    }

    // Smooth scroll fallback for older browsers
    function smoothScrollTo(target, duration) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, start, distance, duration);
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

    // Update active navigation link on scroll with throttling
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('.section');
        const scrollPos = window.scrollY + 120; // Account for header height

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Show/hide scroll to top button
    function toggleScrollToTopButton() {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    // Enhanced scroll to top functionality
    scrollToTopBtn.addEventListener('click', () => {
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            smoothScrollTo(0, 800);
        }
    });

    // Throttled scroll handling for better performance
    let scrollTimeout;
    let rafId;

    function handleScroll() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
            updateActiveNavLink();
            toggleScrollToTopButton();
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize all functionality
    initializeTouchOptimizations();
    initializeMobileMenu();
    initializeSmoothScrolling();

    // Load dynamic content
    loadProjects();
    loadAchievements();

    // Add intersection observer for scroll animations
    initializeScrollAnimations();

    // Initialize form enhancements
    initializeFormEnhancements();
});

// Enhanced form handling for mobile
function initializeFormEnhancements() {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Prevent zoom on iOS when focusing inputs
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
        }

        // Auto-resize textareas
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            });
        }

        // Enhanced validation feedback
        input.addEventListener('blur', () => {
            if (input.validity.valid) {
                input.style.borderColor = '#10b981';
            } else if (input.value) {
                input.style.borderColor = '#ef4444';
            }
        });

        input.addEventListener('input', () => {
            if (input.style.borderColor === '#ef4444' && input.validity.valid) {
                input.style.borderColor = '#10b981';
            }
        });
    });
}

// Enhanced scroll animations with better performance
function initializeScrollAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Remove observer after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and content sections
    const animatedElements = document.querySelectorAll('.project-card, .achievement-card, .about-content, .education-content, .contact-content');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Projects Management with enhanced error handling
async function loadProjects() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${API_BASE}/projects`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.log('Backend not available, using dummy data:', error.message);
        displayDummyProjects();
    }
}

function displayDummyProjects() {
    const dummyProjects = [
        {
            id: 1,
            title: "E-Commerce Website",
            description: "A full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
            technologies: "React, Node.js, MongoDB, Stripe API",
            imageUrl: "https://via.placeholder.com/400x250?text=E-Commerce+Project",
            demoUrl: "https://demo-ecommerce.com",
            githubUrl: "https://github.com/user/ecommerce-project"
        },
        {
            id: 2,
            title: "Task Management App",
            description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
            technologies: "Vue.js, ASP.NET Core, SignalR, SQL Server",
            imageUrl: "https://via.placeholder.com/400x250?text=Task+Manager",
            demoUrl: "https://demo-taskmanager.com",
            githubUrl: "https://github.com/user/task-manager"
        },
        {
            id: 3,
            title: "Weather Dashboard",
            description: "A responsive weather dashboard that displays current weather, forecasts, and historical data with interactive charts and maps.",
            technologies: "JavaScript, Chart.js, OpenWeather API, Bootstrap",
            imageUrl: "https://via.placeholder.com/400x250?text=Weather+Dashboard",
            demoUrl: "https://demo-weather.com",
            githubUrl: "https://github.com/user/weather-dashboard"
        }
    ];
    displayProjects(dummyProjects);
}

function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';

        const techTags = project.technologies.split(',').map(tech =>
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('');

        projectCard.innerHTML = `
            <img src="${project.imageUrl || 'https://via.placeholder.com/400x250?text=Project'}"
                 alt="${project.title}" class="project-image" loading="lazy">
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    <div class="tech-tags">${techTags}</div>
                </div>
                <div class="project-links">
                    ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                                        <i class="fas fa-external-link-alt"></i> Live Demo
                                    </a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                                        <i class="fab fa-github"></i> GitHub
                                    </a>` : ''}
                </div>
            </div>
        `;
        
        // Add staggered animation delay
        projectCard.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(projectCard);
    });

    // Re-initialize scroll animations for new elements
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
}

// Achievements Management with enhanced error handling
async function loadAchievements() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE}/achievements`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const achievements = await response.json();
        displayAchievements(achievements);
    } catch (error) {
        console.log('Backend not available, using dummy data:', error.message);
        displayDummyAchievements();
    }
}

function displayDummyAchievements() {
    const dummyAchievements = [
        {
            id: 1,
            title: "Microsoft Certified: Azure Developer Associate",
            description: "Demonstrated expertise in developing and deploying applications on Microsoft Azure platform.",
            organization: "Microsoft",
            date: "2024-06-15T00:00:00",
            certificateUrl: "https://certificates.microsoft.com/sample"
        },
        {
            id: 2,
            title: "Winner - Local Hackathon 2024",
            description: "First place winner in the annual city hackathon for developing an innovative healthcare management solution.",
            organization: "TechCity",
            date: "2024-03-20T00:00:00",
            certificateUrl: "https://techcity.com/hackathon-winners"
        },
        {
            id: 3,
            title: "AWS Certified Solutions Architect",
            description: "Validated technical expertise in designing distributed applications and systems on AWS.",
            organization: "Amazon Web Services",
            date: "2023-11-08T00:00:00",
            certificateUrl: "https://aws.amazon.com/certification/sample"
        },
        {
            id: 4,
            title: "Dean's List Recognition",
            description: "Achieved Dean's List recognition for academic excellence with GPA above 3.8.",
            organization: "University of Technology",
            date: "2023-05-30T00:00:00"
        }
    ];
    displayAchievements(dummyAchievements);
}

function displayAchievements(achievements) {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';

    achievements.forEach((achievement, index) => {
        const achievementCard = document.createElement('div');
        achievementCard.className = 'achievement-card';

        const date = new Date(achievement.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        achievementCard.innerHTML = `
            <h3 class="achievement-title">${achievement.title}</h3>
            <div class="achievement-org">${achievement.organization}</div>
            <div class="achievement-date">${date}</div>
            <p class="achievement-description">${achievement.description}</p>
            ${achievement.certificateUrl ? `<a href="${achievement.certificateUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                                <i class="fas fa-certificate"></i> View Certificate
                            </a>` : ''}
        `;
        
        // Add staggered animation delay
        achievementCard.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(achievementCard);
    });

    // Re-initialize scroll animations for new elements
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
}

// Admin Panel Functions
function toggleAdminForm(type) {
    const form = document.getElementById(`${type}-admin-form`);
    const isActive = form.classList.contains('active');
    
    // Close all other admin forms
    document.querySelectorAll('.admin-form').forEach(f => f.classList.remove('active'));
    
    // Toggle current form
    if (!isActive) {
        form.classList.add('active');
        // Scroll to form
        setTimeout(() => {
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Enhanced form submissions with better UX
async function submitForm(url, data, formId, successMessage) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        submitBtn.style.opacity = '0.7';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            form.reset();
            
            // Show success feedback
            submitBtn.textContent = '? Success!';
            submitBtn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.opacity = '';
                submitBtn.disabled = false;
            }, 2000);
            
            // Show success message
            showNotification(successMessage, 'success');
            
            return true;
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        // Show error feedback
        submitBtn.textContent = '? Error';
        submitBtn.style.backgroundColor = '#ef4444';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = '';
            submitBtn.style.opacity = '';
            submitBtn.disabled = false;
        }, 2000);
        
        showNotification('Error submitting form. Please try again.', 'error');
        return false;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Project Form Submission
document.getElementById('project-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        technologies: document.getElementById('project-technologies').value,
        imageUrl: document.getElementById('project-image').value || null,
        demoUrl: document.getElementById('project-demo').value || null,
        githubUrl: document.getElementById('project-github').value || null
    };

    const success = await submitForm(`${API_BASE}/projects`, projectData, 'project-form', 'Project added successfully!');
    if (success) {
        toggleAdminForm('project');
        loadProjects();
    }
});

// Achievement Form Submission
document.getElementById('achievement-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const achievementData = {
        title: document.getElementById('achievement-title').value,
        description: document.getElementById('achievement-description').value,
        organization: document.getElementById('achievement-organization').value,
        date: document.getElementById('achievement-date').value,
        certificateUrl: document.getElementById('achievement-certificate').value || null
    };

    const success = await submitForm(`${API_BASE}/achievements`, achievementData, 'achievement-form', 'Achievement added successfully!');
    if (success) {
        toggleAdminForm('achievement');
        loadAchievements();
    }
});

// Enhanced Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('.submit-btn');
    const loading = document.getElementById('contact-loading');
    const success = document.getElementById('contact-success');
    const error = document.getElementById('contact-error');

    // Hide previous messages
    success.style.display = 'none';
    error.style.display = 'none';

    // Show loading
    loading.style.display = 'block';
    submitBtn.disabled = true;

    const contactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
    };

    try {
        const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        loading.style.display = 'none';
        submitBtn.disabled = false;

        if (response.ok) {
            this.reset();
            success.style.display = 'block';
            showNotification('Message sent successfully!', 'success');
            
            // Scroll to success message
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            error.style.display = 'block';
            showNotification('Error sending message. Please try again.', 'error');
        }
    } catch (err) {
        loading.style.display = 'none';
        submitBtn.disabled = false;
        error.style.display = 'block';
        showNotification('Network error. Please check your connection.', 'error');
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        }, 0);
    });
}