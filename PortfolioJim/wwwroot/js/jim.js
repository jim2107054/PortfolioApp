// Enhanced Portfolio Main JavaScript - Modern Interactive Features
class PortfolioMain {
    constructor() {
        this.baseUrl = '/api';
        this.data = {
            profile: null,
            projects: [],
            achievements: [],
            skills: [],
            education: []
        };
        this.currentSection = 'home';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.showInitialLoading();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupThemeToggle();
        this.setupTypingEffect();
        this.setupParticleSystem();
        await this.loadData();
        this.populateContent();
        this.initializeAnimations();
        this.setupLazyLoading();
        this.hideInitialLoading();
        this.setupProgressBar();
        this.setupFormValidation();
    }

    async loadData() {
        try {
            // Load all data in parallel with fallback
            const [profileRes, projectsRes, achievementsRes, skillsRes, educationRes] = await Promise.allSettled([
                fetch(`${this.baseUrl}/profile`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/projects`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/achievements`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/skills`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/education`).catch(() => ({ ok: false }))
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
                this.data.profile = await profileRes.value.json();
            }

            if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
                this.data.projects = await projectsRes.value.json();
            }

            if (achievementsRes.status === 'fulfilled' && achievementsRes.value.ok) {
                this.data.achievements = await achievementsRes.value.json();
            }

            if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
                this.data.skills = await skillsRes.value.json();
            }

            if (educationRes.status === 'fulfilled' && educationRes.value.ok) {
                this.data.education = await educationRes.value.json();
            }

        } catch (error) {
            console.error('Error loading portfolio data:', error);
        } finally {
            // Always use fallback data to ensure content is displayed
            this.useFallbackData();
        }
    }

    populateContent() {
        this.populateHeroSection();
        this.populateAboutSection();
        this.populateSkillsSection();
        this.populateProjectsSection();
        this.populateEducationSection();
        this.populateAchievementsSection();
        this.updateContactInfo();
    }

    useFallbackData() {
        this.initializeHeroWithFallback();
        this.initializeAboutWithFallback();
        this.initializeSkillsWithFallback();
        this.initializeProjectsWithFallback();
        this.initializeEducationWithFallback();
        this.initializeAchievementsWithFallback();
        this.initializeContactWithFallback();
    }

    initializeHeroWithFallback() {
        const heroName = document.getElementById('hero-name') || document.querySelector('.hero-title');
        const heroTitle = document.getElementById('hero-title') || document.querySelector('.hero-description');
        const heroDesc = document.getElementById('hero-description') || document.querySelector('.hero-paragraph');
        const heroAvatar = document.getElementById('hero-avatar') || document.querySelector('.hero-avatar');

        if (heroName) heroName.textContent = 'MD. Jahid Hasan Jim';
        if (heroTitle) heroTitle.textContent = 'Full Stack Developer & Software Engineer';
        if (heroDesc) heroDesc.textContent = 'Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.';
        
        if (heroAvatar && !heroAvatar.querySelector('img')) {
            heroAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
    }

    initializeAboutWithFallback() {
        const aboutContent = document.getElementById('about-content');
        if (aboutContent) {
            aboutContent.innerHTML = `
                <p>Hello! I'm MD. Jahid Hasan Jim, a passionate full-stack developer with over 3 years of experience creating digital solutions that make a difference. I specialize in modern web technologies and love turning complex problems into simple, beautiful designs.</p>
                <p>My journey in software development started during my computer science studies, where I discovered my passion for creating user-centric applications. I have expertise in .NET, React, JavaScript, and cloud technologies.</p>
                <p>When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.</p>
            `;
        }
    }

    initializeSkillsWithFallback() {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer) return;

        const fallbackSkills = [
            { name: 'JavaScript', icon: 'fab fa-js-square', color: '#f7df1e' },
            { name: 'React', icon: 'fab fa-react', color: '#61dafb' },
            { name: 'Node.js', icon: 'fab fa-node-js', color: '#68a063' },
            { name: 'C#', icon: 'fas fa-code', color: '#239120' },
            { name: 'Python', icon: 'fab fa-python', color: '#3776ab' },
            { name: 'HTML5', icon: 'fab fa-html5', color: '#e34f26' },
            { name: 'CSS3', icon: 'fab fa-css3-alt', color: '#1572b6' },
            { name: 'Git', icon: 'fab fa-git-alt', color: '#f05032' },
            { name: 'Docker', icon: 'fab fa-docker', color: '#2496ed' },
            { name: 'AWS', icon: 'fab fa-aws', color: '#ff9900' }
        ];

        skillsContainer.innerHTML = fallbackSkills.map(skill => `
            <div class="skill-badge" style="--skill-color: ${skill.color}">
                <i class="${skill.icon}"></i>
                <span>${skill.name}</span>
            </div>
        `).join('');
    }

    initializeProjectsWithFallback() {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer) return;

        const fallbackProjects = [
            {
                title: 'E-Commerce Platform',
                description: 'A full-stack e-commerce solution with React frontend and .NET Core backend, featuring user authentication, payment integration, and admin dashboard.',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                technologies: ['React', 'ASP.NET Core', 'SQL Server', 'Stripe API'],
                category: 'Web Development',
                status: 'Completed',
                demoUrl: '#',
                githubUrl: '#'
            },
            {
                title: 'Task Management App',
                description: 'A collaborative task management application with real-time updates, file attachments, and team collaboration features.',
                image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Socket.io'],
                category: 'Web Development',
                status: 'Completed',
                demoUrl: '#',
                githubUrl: '#'
            },
            {
                title: 'Mobile Fitness Tracker',
                description: 'Cross-platform mobile app for fitness tracking with workout plans, progress monitoring, and social features.',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                technologies: ['React Native', 'Firebase', 'Redux', 'Chart.js'],
                category: 'Mobile App',
                status: 'In Progress',
                demoUrl: '#',
                githubUrl: '#'
            }
        ];

        projectsContainer.innerHTML = fallbackProjects.map(project => `
            <div class="project-card" data-category="${project.category}">
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-actions">
                            <a href="${project.demoUrl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>
                            <a href="${project.githubUrl}" target="_blank" class="btn btn-secondary">
                                <i class="fab fa-github"></i> Source Code
                            </a>
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-meta">
                        <span class="project-status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
                        <span class="project-date">2024</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.setupProjectFilters();
    }

    initializeEducationWithFallback() {
        const educationContainer = document.getElementById('education-container');
        if (!educationContainer) return;

        const fallbackEducation = [
            {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University of Technology',
                duration: '2019 - 2023',
                location: 'Dhaka, Bangladesh',
                gpa: '3.8/4.0',
                description: 'Focused on software engineering, web development, and database management. Graduated with honors and participated in various coding competitions.'
            },
            {
                degree: 'Full Stack Web Development Bootcamp',
                school: 'TechBD Institute',
                duration: '2023',
                location: 'Online',
                gpa: 'Certificate',
                description: 'Intensive program covering modern web technologies including React, Node.js, and cloud deployment.'
            }
        ];

        educationContainer.innerHTML = fallbackEducation.map(edu => `
            <div class="education-item">
                <div class="education-content">
                    <h3 class="education-degree">${edu.degree}</h3>
                    <h4 class="education-school">${edu.school}</h4>
                    <div class="education-meta">
                        <span><i class="fas fa-calendar"></i> ${edu.duration}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${edu.location}</span>
                        <span><i class="fas fa-star"></i> ${edu.gpa}</span>
                    </div>
                    <p class="education-description">${edu.description}</p>
                </div>
            </div>
        `).join('');
    }

    initializeAchievementsWithFallback() {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;

        const fallbackAchievements = [
            {
                title: 'AWS Certified Developer',
                organization: 'Amazon Web Services',
                description: 'Demonstrated expertise in developing and maintaining applications on the AWS platform.',
                type: 'Certification',
                date: '2024-01-15',
                level: 'Professional',
                icon: 'fas fa-cloud'
            },
            {
                title: 'Best Innovation Award',
                organization: 'TechBD Hackathon 2023',
                description: 'Awarded for developing an innovative solution for sustainable agriculture using IoT and machine learning.',
                type: 'Award',
                date: '2023-11-20',
                level: 'National',
                icon: 'fas fa-trophy'
            },
            {
                title: 'Microsoft Certified: Azure Developer',
                organization: 'Microsoft',
                description: 'Certified in designing and building cloud solutions on Microsoft Azure platform.',
                type: 'Certification',
                date: '2023-08-10',
                level: 'Professional',
                icon: 'fas fa-certificate'
            }
        ];

        achievementsContainer.innerHTML = fallbackAchievements.map(achievement => `
            <div class="achievement-card" data-type="${achievement.type}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <h4 class="achievement-organization">${achievement.organization}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-meta">
                        <span class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</span>
                        <span class="achievement-type">${achievement.type}</span>
                        <span class="achievement-level">${achievement.level}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    initializeContactWithFallback() {
        const contactDetails = document.getElementById('contact-details');
        if (contactDetails) {
            contactDetails.innerHTML = `
                <div class="contact-item">
                    <i class="fas fa-envelope" aria-hidden="true"></i>
                    <div>
                        <h4>Email</h4>
                        <p><a href="mailto:jahid.hasan.jim@gmail.com">jahid.hasan.jim@gmail.com</a></p>
                    </div>
                </div>
                <div class="contact-item">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i>
                    <div>
                        <h4>WhatsApp</h4>
                        <p><a href="https://wa.me/8801581705456">+880 158 170 5456</a></p>
                    </div>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    <div>
                        <h4>Location</h4>
                        <p>Dhaka, Bangladesh</p>
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Enhanced navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Enhanced contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Enhanced scroll to top
        const backToTop = document.getElementById('back-to-top') || document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', () => this.scrollToTop());
        }

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('load', () => this.handlePageLoad());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        // Form enhancements
        this.enhanceFormInputs();
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu') || document.querySelector('.nav-toggle');
        const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });

            // Close mobile menu on link click
            const links = navMenu.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
        }
    }

    setupScrollEffects() {
        // Enhanced Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'animate-slideUp');
                    
                    // Update active navigation
                    const sectionId = entry.target.id;
                    if (sectionId) {
                        this.updateActiveNav(sectionId);
                    }

                    // Trigger skill bar animations
                    if (entry.target.id === 'about') {
                        this.animateSkillBadges();
                    }

                    // Trigger counter animations
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(counter => this.animateCounter(counter));
                }
            });
        }, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => this.observer.observe(section));

        // Parallax scrolling effects
        this.setupParallaxScrolling();
    }

    setupParallaxScrolling() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-bg');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupThemeToggle() {
        // Create theme toggle button if it doesn't exist
        let themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) {
            themeToggle = document.createElement('button');
            themeToggle.className = 'theme-toggle';
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            
            // Add to navigation
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                navContainer.appendChild(themeToggle);
            }
        }

        // Theme toggle functionality
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    setupTypingEffect() {
        const typingElement = document.querySelector('.hero-description');
        if (!typingElement) return;

        const phrases = [
            'Full Stack Developer',
            'Software Engineer',
            'Problem Solver',
            'Tech Enthusiast'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeEffect = () => {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(typeEffect, 500);
                    return;
                }
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(typeEffect, 2000);
                    return;
                }
            }
            
            setTimeout(typeEffect, isDeleting ? 50 : 100);
        };

        // Start typing effect after a delay
        setTimeout(typeEffect, 2000);
    }

    setupParticleSystem() {
        // Create canvas for particles
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        const heroSection = document.getElementById('home');
        if (heroSection) {
            heroSection.appendChild(canvas);
            this.initParticles(canvas);
        }
    }

    setupProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter || button.textContent.trim();

                // Filter projects
                projectCards.forEach(card => {
                    const category = card.dataset.category;
                    if (filter === 'All' || filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.classList.add('animate-fadeIn');
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('animate-fadeIn');
                    }
                });
            });
        });
    }

    setupProgressBar() {
        // Create progress bar if it doesn't exist
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: var(--gradient-primary);
                z-index: var(--z-fixed);
                transition: width 0.1s ease;
                width: 0%;
            `;
            document.body.appendChild(progressBar);
        }
    }

    setupFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updateFormProgress();
            });

            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    initParticles(canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle());
            }
        };

        const updateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            });
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrameId);
        });
    }

    showInitialLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideInitialLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        
        if (targetId && targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                this.smoothScrollTo(targetElement);
                this.updateActiveNav(targetId.substring(1));
            }
        }
    }

    smoothScrollTo(element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNav(sectionId) {
        if (this.currentSection === sectionId) return;
        
        this.currentSection = sectionId;
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        const backToTop = document.querySelector('.back-to-top');

        // Navbar scroll effect
        if (navbar) {
            navbar.classList.toggle('scrolled', scrolled > 100);
        }

        // Back to top button
        if (backToTop) {
            backToTop.classList.toggle('visible', scrolled > 300);
        }

        // Update progress bar
        this.updateScrollProgress();
    }

    updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    }

    handleResize() {
        // Update particle system
        const canvas = document.querySelector('.particle-canvas');
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }

    handlePageLoad() {
        document.body.classList.add('loaded');
        this.triggerEntryAnimations();
    }

    handleKeyNavigation(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                this.closeModal(activeModal);
            }
            
            const activeMenu = document.querySelector('.nav-menu.active');
            if (activeMenu) {
                activeMenu.classList.remove('active');
                document.querySelector('.nav-toggle').classList.remove('active');
            }
        }
    }

    enhanceFormInputs() {
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (input.parentElement) {
                    input.parentElement.classList.add('focused');
                }
            });

            input.addEventListener('blur', () => {
                if (!input.value.trim() && input.parentElement) {
                    input.parentElement.classList.remove('focused');
                }
            });

            input.addEventListener('input', () => {
                if (input.parentElement) {
                    input.parentElement.classList.toggle('has-content', input.value.trim() !== '');
                }
            });

            if (input.type === 'email') {
                input.addEventListener('input', () => this.validateEmail(input));
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Remove previous validation classes
        field.classList.remove('valid', 'invalid');

        if (field.hasAttribute('required') && !value) {
            isValid = false;
        } else if (field.type === 'email' && value) {
            isValid = this.isValidEmail(value);
        } else if (field.name === 'name' && value.length < 2) {
            isValid = false;
        } else if (field.name === 'message' && value.length < 10) {
            isValid = false;
        }

        field.classList.add(isValid ? 'valid' : 'invalid');
        return isValid;
    }

    updateFormProgress() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const fields = form.querySelectorAll('input[required], textarea[required]');
        const validFields = Array.from(fields).filter(field => this.validateField(field));
        const progress = (validFields.length / fields.length) * 100;

        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        if (progressText) {
            progressText.textContent = Math.round(progress) + '% Complete';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateEmail(input) {
        const isValid = this.isValidEmail(input.value);
        input.classList.toggle('valid', isValid && input.value.trim() !== '');
        input.classList.toggle('invalid', !isValid && input.value.trim() !== '');
    }

    triggerEntryAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 100);
        });
    }

    animateCounter(element) {
        if (element.classList.contains('animated')) return;
        
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(progress * target);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('animated');
            }
        };
        
        requestAnimationFrame(animate);
    }

    animateSkillBadges() {
        const skillBadges = document.querySelectorAll('.skill-badge');
        
        skillBadges.forEach((badge, index) => {
            setTimeout(() => {
                badge.classList.add('animate-zoomIn');
            }, index * 100);
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const contactData = {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim(),
            subject: formData.get('subject')?.trim(),
            message: formData.get('message')?.trim()
        };

        if (!this.validateContactForm(contactData)) {
            return;
        }

        try {
            this.showContactLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showContactSuccess('Thank you! Your message has been sent successfully.');
            form.reset();
            
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('focused', 'has-content');
            });
            
        } catch (error) {
            console.error('Error sending contact message:', error);
            this.showContactError('Sorry, there was an error sending your message. Please try again.');
        } finally {
            this.showContactLoading(false);
        }
    }

    validateContactForm(data) {
        let isValid = true;
        const errors = [];

        if (!data.name || data.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
            isValid = false;
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
            isValid = false;
        }

        if (!data.subject || data.subject.length < 3) {
            errors.push('Subject must be at least 3 characters long');
            isValid = false;
        }

        if (!data.message || data.message.length < 10) {
            errors.push('Message must be at least 10 characters long');
            isValid = false;
        }

        if (!isValid) {
            this.showContactError(errors.join('. '));
        }

        return isValid;
    }

    showContactLoading(show) {
        const submitBtn = document.querySelector('#contact-form button[type="submit"]');
        
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.classList.add('loading');
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitBtn.classList.remove('loading');
            }
        }
    }

    showContactSuccess(message) {
        this.showToast(message, 'success');
    }

    showContactError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toastContainer = this.getToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-slideUp`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    getToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: var(--z-tooltip);
                display: flex;
                flex-direction: column;
                gap: 1rem;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Additional methods for API integration would go here
    populateHeroSection() {
        // Will be implemented when API data is available
    }

    populateAboutSection() {
        // Will be implemented when API data is available
    }

    populateSkillsSection() {
        // Will be implemented when API data is available
    }

    populateProjectsSection() {
        // Will be implemented when API data is available
    }

    populateEducationSection() {
        // Will be implemented when API data is available
    }

    populateAchievementsSection() {
        // Will be implemented when API data is available
    }

    updateContactInfo() {
        // Will be implemented when API data is available
    }

    initializeAnimations() {
        // Animation initialization
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slideUp');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.project-card, .achievement-card, .education-item').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize the portfolio app when the page loads
let portfolioMain;
document.addEventListener('DOMContentLoaded', () => {
    portfolioMain = new PortfolioMain();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioMain;
}