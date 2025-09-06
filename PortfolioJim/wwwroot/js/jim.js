// Portfolio Main JavaScript - Enhanced with Database Integration
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
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupScrollEffects();
        await this.loadData();
        this.populateContent();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Scroll to top button
        const scrollToTop = document.getElementById('scrollToTop');
        if (scrollToTop) {
            scrollToTop.addEventListener('click', () => this.scrollToTop());
        }

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });

            // Close mobile menu when clicking on links
            const links = navLinks.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileToggle.classList.remove('active');
                });
            });
        }
    }

    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Update active navigation
                    const sectionId = entry.target.id;
                    if (sectionId) {
                        this.updateActiveNav(sectionId);
                    }
                }
            });
        }, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => this.observer.observe(section));
    }

    async loadData() {
        try {
            this.showLoading(true);

            // Load all data in parallel
            const [profileRes, projectsRes, achievementsRes, skillsRes, educationRes] = await Promise.all([
                fetch(`${this.baseUrl}/profile`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/projects`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/achievements`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/skills`).catch(() => ({ ok: false })),
                fetch(`${this.baseUrl}/education`).catch(() => ({ ok: false }))
            ]);

            if (profileRes.ok) {
                this.data.profile = await profileRes.json();
            }

            if (projectsRes.ok) {
                this.data.projects = await projectsRes.json();
            }

            if (achievementsRes.ok) {
                this.data.achievements = await achievementsRes.json();
            }

            if (skillsRes.ok) {
                this.data.skills = await skillsRes.json();
            }

            if (educationRes.ok) {
                this.data.education = await educationRes.json();
            }

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showLoading(false);
        }
    }

    populateContent() {
        this.populateHeroSection();
        this.populateAboutSection();
        this.populateProjectsSection();
        this.populateEducationSection();
        this.populateAchievementsSection();
        this.updateMetadata();
    }

    populateHeroSection() {
        if (!this.data.profile) return;

        const profile = this.data.profile;
        
        // Update hero content
        const heroName = document.querySelector('.hero-text h1');
        if (heroName) {
            heroName.textContent = profile.fullName || 'MD. Jahid Hasan Jim';
        }

        const heroTitle = document.querySelector('.hero-text p');
        if (heroTitle) {
            heroTitle.textContent = profile.title || 'Full Stack Developer & Software Engineer';
        }

        const heroDescription = document.querySelector('.work-description p');
        if (heroDescription) {
            heroDescription.textContent = profile.description || 'Passionate about creating innovative web solutions';
        }

        // Update profile image
        const profileImage = document.querySelector('.profile-photo');
        if (profileImage && profile.profileImageUrl) {
            profileImage.src = profile.profileImageUrl;
            profileImage.alt = `${profile.fullName} - Professional photo`;
        }

        // Update social links
        this.updateSocialLinks(profile);
    }

    populateAboutSection() {
        if (!this.data.profile || !this.data.profile.aboutContent) return;

        const aboutText = document.querySelector('.about-text');
        if (aboutText) {
            aboutText.innerHTML = this.formatAboutContent(this.data.profile.aboutContent);
        }

        // Update skills if available
        if (this.data.skills.length > 0) {
            this.updateSkillTags();
        }
    }

    updateSkillTags() {
        const skillsContainer = document.querySelector('.skills');
        if (!skillsContainer) return;

        // Get top skills (limit to 8 for display)
        const topSkills = this.data.skills
            .sort((a, b) => b.proficiencyPercentage - a.proficiencyPercentage)
            .slice(0, 8);

        skillsContainer.innerHTML = topSkills.map(skill => 
            `<div class="skill-tag" role="listitem">${skill.name}</div>`
        ).join('');
    }

    populateProjectsSection() {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer || !this.data.projects.length) return;

        projectsContainer.innerHTML = this.data.projects.map(project => `
            <div class="project-card" role="listitem" data-category="${project.category}">
                <div class="project-image">
                    <img src="${project.imageUrl || 'https://via.placeholder.com/400x250?text=' + encodeURIComponent(project.title)}" alt="${project.title}">
                    <div class="project-overlay">
                        <div class="project-actions">
                            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>` : ''}
                            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                                <i class="fab fa-github"></i> Source Code
                            </a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.split(',').map(tech => 
                            `<span class="tech-tag">${tech.trim()}</span>`
                        ).join('')}
                    </div>
                    <div class="project-meta">
                        <span class="project-status">${project.status}</span>
                        <span class="project-date">${new Date(project.createdDate).getFullYear()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateEducationSection() {
        if (!this.data.education.length) return;

        const educationContent = document.querySelector('.education-content');
        if (!educationContent) return;

        educationContent.innerHTML = this.data.education.map(edu => `
            <div class="education-item">
                <div class="education-degree">${edu.degree}</div>
                <div class="education-school">${edu.school}</div>
                <div class="education-year">${edu.duration}</div>
                ${edu.gpa ? `<div class="education-gpa">GPA: ${edu.gpa}</div>` : ''}
                ${edu.description ? `<div class="education-description">${edu.description}</div>` : ''}
            </div>
        `).join('');
    }

    populateAchievementsSection() {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer || !this.data.achievements.length) return;

        achievementsContainer.innerHTML = this.data.achievements.map(achievement => `
            <div class="achievement-card" role="listitem" data-type="${achievement.type}">
                <div class="achievement-icon">
                    <i class="fas ${this.getAchievementIcon(achievement.type)}"></i>
                </div>
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <h4 class="achievement-organization">${achievement.organization}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-meta">
                        <span class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</span>
                        <span class="achievement-type">${achievement.type}</span>
                    </div>
                    ${achievement.certificateUrl ? `
                        <a href="${achievement.certificateUrl}" target="_blank" rel="noopener noreferrer" class="achievement-link">
                            <i class="fas fa-certificate"></i> View Certificate
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateSocialLinks(profile) {
        // Update LinkedIn
        const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');
        if (profile.linkedInUrl) {
            linkedinLinks.forEach(link => link.href = profile.linkedInUrl);
        }

        // Update GitHub
        const githubLinks = document.querySelectorAll('a[href*="github"]');
        if (profile.gitHubUrl) {
            githubLinks.forEach(link => link.href = profile.gitHubUrl);
        }

        // Update Facebook
        const facebookLinks = document.querySelectorAll('a[href*="facebook"]');
        if (profile.facebookUrl) {
            facebookLinks.forEach(link => link.href = profile.facebookUrl);
        }

        // Update WhatsApp
        const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"]');
        if (profile.whatsAppNumber) {
            const cleanNumber = profile.whatsAppNumber.replace(/[^0-9]/g, '');
            whatsappLinks.forEach(link => {
                link.href = `https://wa.me/${cleanNumber}`;
            });
        }
    }

    updateMetadata() {
        if (!this.data.profile) return;

        const profile = this.data.profile;
        
        // Update page title
        document.title = `${profile.fullName} - ${profile.title}`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `${profile.fullName} - ${profile.description}`;
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                this.updateActiveNav(targetId);
            }
        }
    }

    updateActiveNav(sectionId) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        this.currentSection = sectionId;
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name') || document.getElementById('contact-name').value,
            email: formData.get('email') || document.getElementById('contact-email').value,
            subject: formData.get('subject') || document.getElementById('contact-subject').value,
            message: formData.get('message') || document.getElementById('contact-message').value
        };

        // Validate required fields
        if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
            this.showContactError('Please fill in all required fields.');
            return;
        }

        // Validate email format
        if (!this.isValidEmail(contactData.email)) {
            this.showContactError('Please enter a valid email address.');
            return;
        }

        try {
            this.showContactLoading(true);
            
            const response = await fetch(`${this.baseUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                this.showContactSuccess('Thank you! Your message has been sent successfully.');
                e.target.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending contact message:', error);
            this.showContactError('Sorry, there was an error sending your message. Please try again.');
        } finally {
            this.showContactLoading(false);
        }
    }

    handleScroll() {
        // Update scroll to top button
        const scrollToTop = document.getElementById('scrollToTop');
        if (scrollToTop) {
            if (window.pageYOffset > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        }

        // Update header background on scroll
        const header = document.querySelector('header');
        if (header) {
            if (window.pageYOffset > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const navLinks = document.getElementById('navLinks');
            const mobileToggle = document.getElementById('mobileMenuToggle');
            
            if (navLinks) navLinks.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    initializeAnimations() {
        // Add fade-in animation class to elements
        const animatedElements = document.querySelectorAll('.section, .project-card, .achievement-card, .education-item');
        animatedElements.forEach(element => {
            element.classList.add('fade-in');
        });
    }

    // Utility functions
    formatAboutContent(content) {
        return content.split('\n\n').map(paragraph => 
            `<p>${paragraph.trim()}</p>`
        ).join('');
    }

    getAchievementIcon(type) {
        const icons = {
            'Certification': 'fa-certificate',
            'Award': 'fa-award',
            'Competition': 'fa-trophy',
            'Publication': 'fa-book',
            'Leadership': 'fa-users',
            'Other': 'fa-star'
        };
        return icons[type] || 'fa-star';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading(show) {
        // You can implement a loading overlay here
        console.log(show ? 'Loading...' : 'Loading complete');
    }

    showContactLoading(show) {
        const loading = document.getElementById('contact-loading');
        const submitBtn = document.querySelector('.submit-btn');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }
        }
    }

    showContactSuccess(message) {
        const success = document.getElementById('contact-success');
        const error = document.getElementById('contact-error');
        
        if (success) {
            success.textContent = message;
            success.style.display = 'block';
        }
        if (error) {
            error.style.display = 'none';
        }

        // Hide after 5 seconds
        setTimeout(() => {
            if (success) success.style.display = 'none';
        }, 5000);
    }

    showContactError(message) {
        const error = document.getElementById('contact-error');
        const success = document.getElementById('contact-success');
        
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
        if (success) {
            success.style.display = 'none';
        }

        // Hide after 5 seconds
        setTimeout(() => {
            if (error) error.style.display = 'none';
        }, 5000);
    }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioMain = new PortfolioMain();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioMain;
}