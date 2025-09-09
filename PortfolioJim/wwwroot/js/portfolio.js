// Enhanced Portfolio JavaScript with Admin Integration
class PortfolioManager {
    constructor() {
        this.data = {
            profile: null,
            skills: [],
            projects: [],
            education: [],
            achievements: [],
            contacts: []
        };
        this.isLoading = false;
        this.adminAuth = null;
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        this.setupEventListeners();
        await this.loadPortfolioData();
        this.initializeAdminIntegration();
        this.renderContent();
        this.hideLoadingScreen();
        this.initializeAnimations();
        this.setupContactForm();
        this.updateCopyrightYear();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    this.updateActiveNavLink(anchor.getAttribute('href'));
                    
                    // Close mobile menu when link is clicked
                    this.closeMobileMenu();
                }
            });
        });

        // Hamburger menu toggle functionality
        this.setupMobileMenu();

        // Navbar scroll behavior
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
            this.updateActiveNavOnScroll();
            this.handleBackToTopButton();
        });

        // Back to top button
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Project filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterProjects(btn.dataset.filter);
                this.updateActiveFilter(btn);
            });
        });

        // Window resize for mobile menu
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                this.closeMobileMenu();
            }
        });

        // Escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Storage event listener for real-time updates from admin
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolioData' && e.newValue) {
                console.log('Portfolio data updated from admin dashboard');
                this.handleDataUpdate(JSON.parse(e.newValue));
            }
        });

        // Admin logout event listener
        window.addEventListener('adminLogout', () => {
            this.handleAdminLogout();
        });

        // Data update event listener
        window.addEventListener('portfolioDataUpdate', (e) => {
            this.handleDataUpdate(e.detail);
        });

        // Listen for messages from admin window
        window.addEventListener('message', (e) => {
            if (e.data.type === 'adminDataUpdate') {
                console.log('Received data update from admin:', e.data.data);
                this.handleDataUpdate(e.data.data);
            }
        });
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navToggle || !navMenu) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Close menu when clicking on overlay
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle touch events for better mobile experience
        let touchStartY = 0;
        navMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        navMenu.addEventListener('touchmove', (e) => {
            if (navMenu.classList.contains('active')) {
                const touchY = e.touches[0].clientY;
                const deltaY = touchY - touchStartY;
                
                // Prevent scrolling when menu is open
                if (Math.abs(deltaY) > 10) {
                    e.preventDefault();
                }
            }
        });

        // Add keyboard navigation support
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });

        // Enhanced navigation link handling
        navLinks.forEach((link, index) => {
            link.addEventListener('focus', () => {
                if (window.innerWidth <= 992 && !navMenu.classList.contains('active')) {
                    this.openMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        // Add active classes
        navToggle.classList.add('active');
        navMenu.classList.add('active');
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', 'true');
        navMenu.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.classList.add('nav-open');
        
        // Create and show overlay
        this.createMobileOverlay();
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstNavLink = navMenu.querySelector('.nav-link');
            if (firstNavLink) {
                firstNavLink.focus();
            }
        }, 300);

        // Announce to screen readers
        this.announceToScreenReader('Navigation menu opened');
    }

    closeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        // Remove active classes
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
        
        // Allow body scroll
        document.body.classList.remove('nav-open');
        
        // Remove overlay
        this.removeMobileOverlay();

        // Return focus to toggle button
        if (document.activeElement !== navToggle) {
            navToggle.focus();
        }

        // Announce to screen readers
        this.announceToScreenReader('Navigation menu closed');
    }

    createMobileOverlay() {
        // Remove existing overlay if any
        this.removeMobileOverlay();
        
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        
        // Close menu when overlay is clicked
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    removeMobileOverlay() {
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    async loadPortfolioData() {
        try {
            // Always load from localStorage first (this is where admin saves data)
            const cachedData = this.loadCachedData();
            if (cachedData) {
                this.data = { ...this.data, ...cachedData };
                console.log('Loaded portfolio data:', this.data);
            } else {
                // If no cached data, load default data
                this.loadDefaultData();
            }

            // Initialize mock API if not already done
            if (!window.mockAPI) {
                await this.initializeMockAPI();
            }

            // Try to load fresh data from mock API
            await this.loadFromMockAPI();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            // Fall back to default data if no cached data and API fails
            if (!this.data.profile) {
                this.loadDefaultData();
            }
        }
    }

    async initializeMockAPI() {
        // Initialize mock API if the script is loaded
        if (typeof MockAPIService !== 'undefined') {
            window.mockAPI = new MockAPIService();
        }
    }

    loadCachedData() {
        try {
            const cached = localStorage.getItem('portfolioData');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error loading cached data:', error);
            return null;
        }
    }

    async loadFromMockAPI() {
        if (!window.mockAPI) return;

        try {
            // Load all data sections
            const [profile, skills, projects, education, achievements, contacts] = await Promise.all([
                window.mockAPI.getProfile(),
                window.mockAPI.getSkills(),
                window.mockAPI.getProjects(),
                window.mockAPI.getEducation(),
                window.mockAPI.getAchievements(),
                window.mockAPI.getContacts()
            ]);

            // Update data if API returns valid results
            if (profile) this.data.profile = profile;
            if (skills && skills.length > 0) this.data.skills = skills;
            if (projects && projects.length > 0) this.data.projects = projects;
            if (education && education.length > 0) this.data.education = education;
            if (achievements && achievements.length > 0) this.data.achievements = achievements;
            if (contacts && contacts.length > 0) this.data.contacts = contacts;

            console.log('Updated data from mock API:', this.data);
        } catch (error) {
            console.warn('Mock API not available, using cached data');
        }
    }

    loadDefaultData() {
        this.data = {
            profile: {
                fullName: "MD. Jahid Hasan Jim",
                title: "Full Stack Developer & Software Engineer",
                description: "Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.",
                aboutContent: `Hello! I'm MD. Jahid Hasan Jim, a passionate full-stack developer with over 3 years of experience 
                creating digital solutions that make a difference. I specialize in modern web technologies and love 
                turning complex problems into simple, beautiful designs.

                My journey in software development started during my computer science studies, where I discovered 
                my passion for creating user-centric applications. I have expertise in .NET, React, JavaScript, 
                and cloud technologies.`,
                email: "jahid.hasan.jim@gmail.com",
                linkedInUrl: "https://www.linkedin.com/in/md-jahid-hasan-jim/",
                gitHubUrl: "https://github.com/jim2107054",
                facebookUrl: "https://facebook.com/jahid.hasan.jim",
                whatsAppNumber: "+8801581705456",
                profileImageUrl: "images/portfolio.jpg"
            },
            skills: [
                { name: "JavaScript", category: "Frontend", level: "Advanced", iconClass: "fab fa-js-square", proficiencyPercentage: 90 },
                { name: "React", category: "Frontend", level: "Advanced", iconClass: "fab fa-react", proficiencyPercentage: 85 },
                { name: "Node.js", category: "Backend", level: "Intermediate", iconClass: "fab fa-node-js", proficiencyPercentage: 80 },
                { name: "C#", category: "Languages", level: "Advanced", iconClass: "fas fa-code", proficiencyPercentage: 90 },
                { name: ".NET", category: "Backend", level: "Advanced", iconClass: "fas fa-server", proficiencyPercentage: 85 },
                { name: "SQL Server", category: "Database", level: "Intermediate", iconClass: "fas fa-database", proficiencyPercentage: 75 },
                { name: "Azure", category: "DevOps", level: "Intermediate", iconClass: "fab fa-microsoft", proficiencyPercentage: 70 },
                { name: "Git", category: "Tools", level: "Advanced", iconClass: "fab fa-git-alt", proficiencyPercentage: 85 }
            ],
            projects: [
                {
                    title: "E-commerce Platform",
                    description: "A full-stack e-commerce solution built with React and .NET Core",
                    technologies: "React, .NET Core, SQL Server, Azure",
                    imageUrl: "images/project1.jpg",
                    demoUrl: "https://demo.example.com",
                    githubUrl: "https://github.com/jim2107054/ecommerce",
                    category: "Web Development",
                    status: "Completed"
                },
                {
                    title: "Task Management App",
                    description: "A collaborative task management application with real-time updates",
                    technologies: "React, Node.js, MongoDB, Socket.io",
                    imageUrl: "images/project2.jpg",
                    demoUrl: "https://tasks.example.com",
                    githubUrl: "https://github.com/jim2107054/taskmanager",
                    category: "Web Development",
                    status: "Completed"
                },
                {
                    title: "Mobile Expense Tracker",
                    description: "Cross-platform mobile app for tracking personal expenses",
                    technologies: "React Native, Firebase, Chart.js",
                    imageUrl: "images/project3.jpg",
                    demoUrl: "https://play.google.com/store",
                    githubUrl: "https://github.com/jim2107054/expense-tracker",
                    category: "Mobile App",
                    status: "In Progress"
                }
            ],
            education: [
                {
                    degree: "Bachelor of Science in Computer Science",
                    school: "University of Technology",
                    duration: "2019 - 2023",
                    location: "Dhaka, Bangladesh",
                    gpa: "3.8/4.0",
                    description: "Focused on software engineering, web development, and database management systems."
                }
            ],
            achievements: [
                {
                    title: "Microsoft Certified: Azure Developer Associate",
                    organization: "Microsoft",
                    date: "2023-06-15",
                    type: "Certification",
                    level: "Professional",
                    description: "Certified in developing and maintaining cloud applications on Microsoft Azure platform.",
                    certificateUrl: "https://www.credly.com/badges/example"
                },
                {
                    title: "Best Innovation Award",
                    organization: "Tech Conference 2023",
                    date: "2023-03-20",
                    type: "Award",
                    level: "National",
                    description: "Awarded for developing an innovative solution for healthcare data management.",
                    certificateUrl: ""
                }
            ]
        };
        this.cacheData();
    }

    cacheData() {
        try {
            localStorage.setItem('portfolioData', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }

    initializeAdminIntegration() {
        // Initialize admin authentication if available
        if (window.adminAuth) {
            this.adminAuth = window.adminAuth;
            
            // Check if user is logged in and show appropriate admin button
            if (this.adminAuth.isAuthenticated()) {
                this.showAdminFeatures();
            }
        }

        // Listen for admin state changes
        window.addEventListener('adminStateChange', (e) => {
            if (e.detail.isAuthenticated) {
                this.showAdminFeatures();
            } else {
                this.hideAdminFeatures();
            }
        });
    }

    showAdminFeatures() {
        // Show admin indicators and quick access features
        this.addAdminToolbar();
        
        // Add edit buttons to sections (if admin is logged in)
        this.addEditButtons();
    }

    hideAdminFeatures() {
        // Remove admin toolbar and edit buttons
        document.querySelector('.admin-floating-toolbar')?.remove();
        document.querySelectorAll('.admin-edit-btn').forEach(btn => btn.remove());
    }

    addAdminToolbar() {
        // Remove existing toolbar
        document.querySelector('.admin-floating-toolbar')?.remove();

        // Create floating admin toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'admin-floating-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-content">
                <button class="toolbar-btn" onclick="window.location.href='admin.html'" title="Admin Dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                </button>
                <button class="toolbar-btn" onclick="portfolioManager.refreshContent()" title="Refresh Content">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="toolbar-btn" onclick="portfolioManager.togglePreviewMode()" title="Preview Mode">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
        document.body.appendChild(toolbar);
    }

    addEditButtons() {
        // Add edit buttons to major sections
        const sections = ['about', 'projects', 'achievements', 'contact'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const editBtn = document.createElement('button');
                editBtn.className = 'admin-edit-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = `Edit ${sectionId} section`;
                editBtn.onclick = () => this.editSection(sectionId);
                
                const sectionHeader = section.querySelector('.section-header, .hero-container');
                if (sectionHeader) {
                    sectionHeader.appendChild(editBtn);
                }
            }
        });
    }

    editSection(sectionId) {
        // Redirect to admin panel with specific section
        window.location.href = `admin.html#${sectionId}`;
    }

    async refreshContent() {
        this.showToast('Refreshing content...', 'info');
        await this.loadPortfolioData();
        this.renderContent();
        this.showToast('Content refreshed!', 'success');
    }

    togglePreviewMode() {
        document.body.classList.toggle('preview-mode');
        const isPreview = document.body.classList.contains('preview-mode');
        this.showToast(isPreview ? 'Preview mode enabled' : 'Preview mode disabled', 'info');
    }

    handleDataUpdate(updatedData) {
        console.log('Handling data update:', updatedData);
        this.data = { ...this.data, ...updatedData };
        this.cacheData();
        this.renderContent();
        this.showToast('Content updated from admin panel', 'success');
    }

    renderContent() {
        console.log('Rendering content with data:', this.data);
        this.renderProfile();
        this.renderAbout();
        this.renderSkills();
        this.renderProjects();
        this.renderEducation();
        this.renderAchievements();
        this.renderContact();
    }

    renderProfile() {
        if (!this.data.profile) return;

        const profile = this.data.profile;
        
        // Update hero section
        const heroName = document.getElementById('hero-name');
        const heroTitle = document.getElementById('hero-title');
        const heroDescription = document.getElementById('hero-description');
        const heroAvatar = document.getElementById('hero-avatar');
        const heroSocial = document.getElementById('hero-social');

        if (heroName) heroName.textContent = profile.fullName || 'MD. Jahid Hasan Jim';
        if (heroTitle) heroTitle.textContent = profile.title || 'Full Stack Developer & Software Engineer';
        if (heroDescription) heroDescription.textContent = profile.description || '';
        
        if (heroAvatar && profile.profileImageUrl) {
            const img = heroAvatar.querySelector('img');
            if (img) img.src = profile.profileImageUrl;
        }

        // Update social links
        if (heroSocial && profile) {
            heroSocial.innerHTML = `
                ${profile.linkedInUrl ? `<a href="${profile.linkedInUrl}" class="social-link" aria-label="LinkedIn Profile" target="_blank">
                    <i class="fab fa-linkedin"></i>
                </a>` : ''}
                ${profile.gitHubUrl ? `<a href="${profile.gitHubUrl}" class="social-link" aria-label="GitHub Profile" target="_blank">
                    <i class="fab fa-github"></i>
                </a>` : ''}
                ${profile.facebookUrl ? `<a href="${profile.facebookUrl}" class="social-link" aria-label="Facebook Profile" target="_blank">
                    <i class="fab fa-facebook"></i>
                </a>` : ''}
                ${profile.whatsAppNumber ? `<a href="https://wa.me/${profile.whatsAppNumber.replace(/[^0-9]/g, '')}" class="social-link" aria-label="WhatsApp Contact" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                </a>` : ''}
            `;
        }

        // Update document title
        document.title = `${profile.fullName} - Portfolio | ${profile.title}`;
    }

    renderAbout() {
        if (!this.data.profile?.aboutContent) return;

        const aboutContent = document.getElementById('about-content');
        if (aboutContent) {
            const paragraphs = this.data.profile.aboutContent.split('\n\n').filter(p => p.trim());
            aboutContent.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
        }
    }

    renderSkills() {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer || !this.data.skills || this.data.skills.length === 0) {
            console.log('No skills to render or container not found');
            return;
        }

        console.log('Rendering skills:', this.data.skills);
        
        const skillsByCategory = this.groupBy(this.data.skills, 'category');
        
        skillsContainer.innerHTML = Object.entries(skillsByCategory).map(([category, skills]) => `
            <div class="skill-category">
                <h4 class="skill-category-title">${category}</h4>
                <div class="skills-list">
                    ${skills.map(skill => `
                        <div class="skill-item" data-skill-level="${skill.level}">
                            <div class="skill-header">
                                <span class="skill-name">
                                    ${skill.iconClass ? `<i class="${skill.iconClass}"></i>` : ''}
                                    ${skill.name}
                                </span>
                                <span class="skill-percentage">${skill.proficiencyPercentage || 75}%</span>
                            </div>
                            <div class="skill-progress">
                                <div class="skill-progress-bar" style="width: ${skill.proficiencyPercentage || 75}%"></div>
                            </div>
                            <div class="skill-level">${skill.level || 'Intermediate'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderProjects() {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer || !this.data.projects || this.data.projects.length === 0) {
            console.log('No projects to render or container not found');
            return;
        }

        console.log('Rendering projects:', this.data.projects);

        projectsContainer.innerHTML = this.data.projects.map(project => `
            <div class="project-card" data-category="${project.category}" data-status="${project.status}">
                <div class="project-image">
                    <img src="${project.imageUrl || 'images/project-placeholder.jpg'}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-links">
                            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="project-link demo-link" aria-label="View Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </a>` : ''}
                            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link code-link" aria-label="View Code">
                                <i class="fab fa-github"></i>
                            </a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-header">
                        <h3 class="project-title">${project.title}</h3>
                        <span class="project-status status-${project.status?.toLowerCase().replace(' ', '-')}">${project.status || 'Completed'}</span>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies ? project.technologies.split(',').map(tech => 
                            `<span class="tech-tag">${tech.trim()}</span>`
                        ).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEducation() {
        const educationContainer = document.getElementById('education-container');
        if (!educationContainer || !this.data.education || this.data.education.length === 0) {
            console.log('No education to render or container not found');
            return;
        }

        console.log('Rendering education:', this.data.education);

        educationContainer.innerHTML = this.data.education.map(edu => `
            <div class="education-item">
                <div class="education-content">
                    <div class="education-header">
                        <h3 class="education-degree">${edu.degree}</h3>
                        <span class="education-duration">${edu.duration}</span>
                    </div>
                    <p class="education-school">
                        <i class="fas fa-university"></i>
                        ${edu.school}
                    </p>
                    ${edu.location ? `<p class="education-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${edu.location}
                    </p>` : ''}
                    ${edu.gpa ? `<p class="education-gpa">
                        <strong>GPA:</strong> ${edu.gpa}
                    </p>` : ''}
                    ${edu.description ? `<p class="education-description">${edu.description}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderAchievements() {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer || !this.data.achievements || this.data.achievements.length === 0) {
            console.log('No achievements to render or container not found');
            return;
        }

        console.log('Rendering achievements:', this.data.achievements);

        achievementsContainer.innerHTML = this.data.achievements.map(achievement => `
            <div class="achievement-card" data-type="${achievement.type}" data-level="${achievement.level}">
                <div class="achievement-icon">
                    <i class="fas ${this.getAchievementIcon(achievement.type)}"></i>
                </div>
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-org">
                        <i class="fas fa-building"></i>
                        ${achievement.organization}
                    </p>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-meta">
                        <span class="achievement-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(achievement.date).toLocaleDateString()}
                        </span>
                        <span class="achievement-level">
                            <i class="fas fa-medal"></i>
                            ${achievement.level}
                        </span>
                    </div>
                    ${achievement.certificateUrl ? `
                        <a href="${achievement.certificateUrl}" target="_blank" class="achievement-certificate">
                            <i class="fas fa-certificate"></i>
                            View Certificate
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderContact() {
        if (!this.data.profile) return;

        const contactDetails = document.getElementById('contact-details');
        if (contactDetails) {
            contactDetails.innerHTML = `
                <div class="contact-item">
                    <i class="fas fa-envelope" aria-hidden="true"></i>
                    <div>
                        <h4>Email</h4>
                        <p><a href="mailto:${this.data.profile.email}">${this.data.profile.email}</a></p>
                    </div>
                </div>
                ${this.data.profile.whatsAppNumber ? `
                <div class="contact-item">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i>
                    <div>
                        <h4>WhatsApp</h4>
                        <p><a href="https://wa.me/${this.data.profile.whatsAppNumber.replace(/[^0-9]/g, '')}">${this.data.profile.whatsAppNumber}</a></p>
                    </div>
                </div>
                ` : ''}
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

    getAchievementIcon(type) {
        const icons = {
            'Certification': 'fa-certificate',
            'Award': 'fa-trophy',
            'Competition': 'fa-medal',
            'Publication': 'fa-book',
            'Other': 'fa-star'
        };
        return icons[type] || 'fa-star';
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    }

    filterProjects(filter) {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }

    handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    updateActiveNavLink(target) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`a[href="${target}"]`)?.classList.add('active');
    }

    handleBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
            
            // Form progress tracking
            const formInputs = contactForm.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                input.addEventListener('input', () => this.updateFormProgress());
            });
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email',
            subject: formData.get('subject'),
            message: formData.get('message'),
            createdDate: new Date().toISOString(),
            isRead: false
        };

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            // Use mock API to save contact
            if (window.mockAPI) {
                const result = await window.mockAPI.addContact(contactData);
                if (result) {
                    this.showToast('Message sent successfully!', 'success');
                    e.target.reset();
                    this.updateFormProgress();
                } else {
                    throw new Error('Failed to send message');
                }
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Fallback: store in localStorage
            const contacts = JSON.parse(localStorage.getItem('portfolioContacts') || '[]');
            contacts.push(contactData);
            localStorage.setItem('portfolioContacts', JSON.stringify(contacts));
            
            this.showToast('Message saved! Will be sent when connection is restored.', 'warning');
            e.target.reset();
            this.updateFormProgress();
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    updateFormProgress() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        const filled = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const progress = (filled / inputs.length) * 100;

        const progressFill = form.querySelector('.progress-fill');
        const progressText = form.querySelector('.progress-text');

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }, 1000);
        }
    }

    initializeAnimations() {
        // Initialize intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.project-card, .achievement-card, .skill-category, .education-item').forEach(el => {
            observer.observe(el);
        });
    }

    updateCopyrightYear() {
        const yearElements = document.querySelectorAll('#current-year');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.portfolio-toast').forEach(toast => toast.remove());

        // Create toast
        const toast = document.createElement('div');
        toast.className = `portfolio-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, 4000);
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

    handleAdminLogout() {
        this.hideAdminFeatures();
        this.showToast('Admin logged out', 'info');
    }

    // Enhanced Hero Section functionality
    initializeHero() {
        this.createParticles();
        this.animateCounters();
        this.setupTypingEffect();
        this.addScrollParallax();
    }

    createParticles() {
        const particlesContainer = document.getElementById('hero-particles');
        if (!particlesContainer) return;

        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size between 2px and 6px
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random horizontal position
            particle.style.left = Math.random() * 100 + '%';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 15 + 's';
            
            // Random animation duration
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            particlesContainer.appendChild(particle);
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.hero-stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = counter.textContent.replace(/[0-9]+/, target);
                    clearInterval(timer);
                } else {
                    counter.textContent = counter.textContent.replace(/[0-9]+/, Math.ceil(current));
                }
            }, 40);
        };

        // Use Intersection Observer to trigger animation when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => animateCounter(counter));
                    observer.disconnect(); // Run only once
                }
            });
        }, { threshold: 0.5 });

        const heroSection = document.getElementById('home');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }

    setupTypingEffect() {
        const titles = [
            'Full Stack Developer',
            'Software Engineer', 
            'Web Developer',
            'Problem Solver',
            'Tech Enthusiast'
        ];
        
        const titleElement = document.getElementById('hero-title');
        if (!titleElement) return;

        let titleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;

        const typeTitle = () => {
            const currentTitle = titles[titleIndex];
            
            if (!isDeleting && charIndex < currentTitle.length) {
                // Typing
                titleElement.textContent = currentTitle.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(typeTitle, 100);
            } else if (isDeleting && charIndex > 0) {
                // Deleting
                titleElement.textContent = currentTitle.substring(0, charIndex - 1);
                charIndex--;
                setTimeout(typeTitle, 50);
            } else if (!isDeleting && charIndex === currentTitle.length) {
                // Pause before deleting
                if (!isPaused) {
                    isPaused = true;
                    setTimeout(() => {
                        isPaused = false;
                        isDeleting = true;
                        typeTitle();
                    }, 2000);
                }
            } else if (isDeleting && charIndex === 0) {
                // Move to next title
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
                setTimeout(typeTitle, 200);
            }
        };

        // Start typing effect after a delay
        setTimeout(typeTitle, 1000);
    }

    addScrollParallax() {
        const hero = document.getElementById('home');
        const heroContent = hero?.querySelector('.hero-content');
        
        if (!hero || !heroContent) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            const scrollPercent = scrolled / heroHeight;
            
            if (scrollPercent <= 1) {
                // Parallax effect for hero content
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                
                // Fade out effect
                const opacity = Math.max(0, 1 - scrollPercent * 1.5);
                heroContent.style.opacity = opacity;
            }
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const optimizedScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScroll);
    }

    // Enhanced smooth scrolling with easing
    smoothScrollTo(target) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 80; // Account for fixed navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    // Add floating animation to hero elements
    addFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.hero-skills .skill-tag');
        
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.classList.add('floating-element');
        });
    }

    // Enhanced initialization
    init() {
        this.initializeHero();
        this.addFloatingAnimations();
        this.loadPortfolioData();
        this.setupEventListeners();
        this.updateActiveNavOnScroll();
        this.initializeContactForm();
        this.checkAdminStatus();
        this.addScrollAnimations();
    }
}

// Initialize portfolio manager
let portfolioManager;
document.addEventListener('DOMContentLoaded', () => {
    portfolioManager = new PortfolioManager();
    
    // Make it globally accessible
    window.portfolioManager = portfolioManager;
});

// Service Worker Registration (if supported)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioManager;
}