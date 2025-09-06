// Portfolio Website JavaScript - Database Integration
class PortfolioApp {
    constructor() {
        this.baseUrl = '/api';
        this.data = {
            profile: null,
            projects: [],
            achievements: [],
            skills: [],
            education: []
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.populatePortfolio();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    async loadData() {
        try {
            // Show loading indicator
            this.showLoading(true);

            // Load all data in parallel
            const [profileRes, projectsRes, achievementsRes, skillsRes, educationRes] = await Promise.all([
                fetch(`${this.baseUrl}/profile`),
                fetch(`${this.baseUrl}/projects`),
                fetch(`${this.baseUrl}/achievements`),
                fetch(`${this.baseUrl}/skills`),
                fetch(`${this.baseUrl}/education`)
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
            this.showErrorMessage('Failed to load portfolio data. Please refresh the page.');
        }
    }

    populatePortfolio() {
        this.populateHeroSection();
        this.populateAboutSection();
        this.populateSkillsSection();
        this.populateProjectsSection();
        this.populateEducationSection();
        this.populateAchievementsSection();
        this.updateContactInfo();
    }

    populateHeroSection() {
        if (!this.data.profile) return;

        const profile = this.data.profile;
        
        // Update hero content
        const heroName = document.querySelector('.hero-name, .hero h1');
        if (heroName) {
            heroName.textContent = profile.fullName || 'MD. Jahid Hasan Jim';
        }

        const heroTitle = document.querySelector('.hero-title, .hero h2');
        if (heroTitle) {
            heroTitle.textContent = profile.title || 'Full Stack Developer & Software Engineer';
        }

        const heroDescription = document.querySelector('.hero-description, .hero p');
        if (heroDescription) {
            heroDescription.textContent = profile.description || 'Passionate about creating innovative web solutions';
        }

        // Update profile image
        const profileImage = document.querySelector('.hero-image img, .profile-image');
        if (profileImage && profile.profileImageUrl) {
            profileImage.src = profile.profileImageUrl;
            profileImage.alt = profile.fullName;
        }

        // Update social links
        this.updateSocialLinks(profile);
    }

    populateAboutSection() {
        if (!this.data.profile || !this.data.profile.aboutContent) return;

        const aboutContent = document.querySelector('.about-content, .about-text');
        if (aboutContent) {
            aboutContent.innerHTML = this.formatAboutContent(this.data.profile.aboutContent);
        }
    }

    populateSkillsSection() {
        const skillsContainer = document.querySelector('.skills-container, .skills-grid');
        if (!skillsContainer || !this.data.skills.length) return;

        const skillsByCategory = this.groupSkillsByCategory(this.data.skills);
        
        skillsContainer.innerHTML = Object.entries(skillsByCategory).map(([category, skills]) => `
            <div class="skill-category">
                <h3 class="category-title">${category}</h3>
                <div class="skills-list">
                    ${skills.map(skill => `
                        <div class="skill-item" data-skill="${skill.name}">
                            <div class="skill-header">
                                ${skill.iconClass ? `<i class="${skill.iconClass}"></i>` : ''}
                                <span class="skill-name">${skill.name}</span>
                                <span class="skill-level">${skill.level}</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-progress" data-progress="${skill.proficiencyPercentage}">
                                    <div class="progress-fill" style="width: 0%"></div>
                                </div>
                                <span class="skill-percentage">${skill.proficiencyPercentage}%</span>
                            </div>
                            <div class="skill-experience">
                                ${skill.yearsOfExperience} year${skill.yearsOfExperience !== 1 ? 's' : ''} experience
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Animate skill bars on scroll
        this.animateSkillBars();
    }

    populateProjectsSection() {
        const projectsContainer = document.querySelector('.projects-container, .projects-grid');
        if (!projectsContainer || !this.data.projects.length) return;

        projectsContainer.innerHTML = this.data.projects.map(project => `
            <div class="project-card" data-category="${project.category}">
                <div class="project-image">
                    <img src="${project.imageUrl || 'https://via.placeholder.com/400x250?text=' + encodeURIComponent(project.title)}" alt="${project.title}">
                    <div class="project-overlay">
                        <div class="project-actions">
                            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>` : ''}
                            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-secondary">
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
                        <span class="project-status status-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
                        <span class="project-date">${new Date(project.createdDate).getFullYear()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateEducationSection() {
        const educationContainer = document.querySelector('.education-container, .education-timeline');
        if (!educationContainer || !this.data.education.length) return;

        educationContainer.innerHTML = this.data.education.map(edu => `
            <div class="education-item">
                <div class="education-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="education-content">
                    <h3 class="education-degree">${edu.degree}</h3>
                    <h4 class="education-school">${edu.school}</h4>
                    <div class="education-meta">
                        <span class="education-duration">${edu.duration}</span>
                        ${edu.location ? `<span class="education-location">${edu.location}</span>` : ''}
                        ${edu.gpa ? `<span class="education-gpa">GPA: ${edu.gpa}</span>` : ''}
                    </div>
                    ${edu.description ? `<p class="education-description">${edu.description}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    populateAchievementsSection() {
        const achievementsContainer = document.querySelector('.achievements-container, .achievements-grid');
        if (!achievementsContainer || !this.data.achievements.length) return;

        achievementsContainer.innerHTML = this.data.achievements.map(achievement => `
            <div class="achievement-card" data-type="${achievement.type}">
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
                        <span class="achievement-level">${achievement.level}</span>
                    </div>
                    ${achievement.certificateUrl ? `
                        <a href="${achievement.certificateUrl}" target="_blank" class="achievement-link">
                            <i class="fas fa-certificate"></i> View Certificate
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateContactInfo() {
        if (!this.data.profile) return;

        const profile = this.data.profile;

        // Update email links
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.href = `mailto:${profile.email}`;
            if (link.textContent.includes('@')) {
                link.textContent = profile.email;
            }
        });

        // Update WhatsApp links
        const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"]');
        if (profile.whatsAppNumber) {
            whatsappLinks.forEach(link => {
                link.href = `https://wa.me/${profile.whatsAppNumber.replace(/[^0-9]/g, '')}`;
            });
        }
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
    }

    setupEventListeners() {
        // Contact form submission
        const contactForm = document.querySelector('.contact-form, #contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Project filtering
        const projectFilters = document.querySelectorAll('.project-filter, .filter-btn');
        projectFilters.forEach(filter => {
            filter.addEventListener('click', (e) => this.filterProjects(e.target.dataset.category));
        });

        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        try {
            this.showSubmissionLoading(true);
            
            const response = await fetch(`${this.baseUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                this.showSuccessMessage('Thank you! Your message has been sent successfully.');
                e.target.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending contact message:', error);
            this.showErrorMessage('Sorry, there was an error sending your message. Please try again.');
        } finally {
            this.showSubmissionLoading(false);
        }
    }

    filterProjects(category) {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                card.classList.add('fadeIn');
            } else {
                card.style.display = 'none';
                card.classList.remove('fadeIn');
            }
        });

        // Update active filter button
        const filterButtons = document.querySelectorAll('.project-filter, .filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    handleSmoothScroll(e) {
        const targetId = e.target.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    initializeAnimations() {
        // Intersection Observer for animations
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

        // Observe sections for animations
        const sections = document.querySelectorAll('section, .project-card, .achievement-card, .skill-item');
        sections.forEach(section => observer.observe(section));
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const animateBar = (bar) => {
            const progress = bar.dataset.progress;
            const fill = bar.querySelector('.progress-fill');
            
            if (fill) {
                setTimeout(() => {
                    fill.style.width = progress + '%';
                }, 500);
            }
        };

        // Use Intersection Observer to animate when skills come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    // Utility functions
    groupSkillsByCategory(skills) {
        return skills.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {});
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

    formatAboutContent(content) {
        // Convert line breaks to paragraphs
        return content.split('\n\n').map(paragraph => 
            `<p>${paragraph.trim()}</p>`
        ).join('');
    }

    showLoading(show) {
        const loader = document.querySelector('.loading-overlay, .loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    showSubmissionLoading(show) {
        const submitBtn = document.querySelector('.contact-form button[type="submit"], #contact-submit');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        }
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
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
}

// Initialize the portfolio app when the page loads
let portfolioApp;
document.addEventListener('DOMContentLoaded', () => {
    portfolioApp = new PortfolioApp();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}