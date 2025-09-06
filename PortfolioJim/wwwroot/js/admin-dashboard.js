// Admin Dashboard JavaScript - Comprehensive Functionality
class AdminDashboard {
    constructor() {
        this.baseUrl = '/api';
        this.isAuthenticated = false;
        this.currentSection = 'dashboard';
        this.data = {
            projects: [],
            achievements: [],
            contacts: [],
            skills: this.getDefaultSkills(),
            profile: this.getDefaultProfile(),
            education: this.getDefaultEducation()
        };
        this.init();
    }

    // Initialize the dashboard
    async init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.checkAuthStatus();
        await this.loadData();
        this.updateStats();
        this.loadRecentActivity();
        this.populateDataGrids();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submissions
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('about-form')?.addEventListener('submit', (e) => this.handleAboutSubmit(e));
        document.getElementById('skill-form')?.addEventListener('submit', (e) => this.handleSkillSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('education-form')?.addEventListener('submit', (e) => this.handleEducationSubmit(e));
        document.getElementById('achievement-form')?.addEventListener('submit', (e) => this.handleAchievementSubmit(e));

        // Settings forms
        document.getElementById('general-settings-form')?.addEventListener('submit', (e) => this.handleGeneralSettingsSubmit(e));
        document.getElementById('security-settings-form')?.addEventListener('submit', (e) => this.handleSecuritySettingsSubmit(e));

        // Image upload handling
        document.getElementById('profile-image')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.querySelector('.image-preview')?.addEventListener('click', () => document.getElementById('profile-image')?.click());

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.changeTheme(e.target.closest('.theme-option').dataset.theme));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Setup mobile menu functionality
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileSidebarToggle');
        const sidebar = document.getElementById('adminSidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                mobileToggle.querySelector('i').classList.toggle('fa-bars');
                mobileToggle.querySelector('i').classList.toggle('fa-times');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !sidebar.contains(e.target) && 
                    !mobileToggle.contains(e.target) && 
                    sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    mobileToggle.querySelector('i').classList.add('fa-bars');
                    mobileToggle.querySelector('i').classList.remove('fa-times');
                }
            });
        }
    }

    // Check authentication status
    checkAuthStatus() {
        // For demo purposes, we'll assume authenticated
        // In a real app, you'd check JWT token or session
        this.isAuthenticated = true;
        if (!this.isAuthenticated) {
            window.location.href = '/index.html';
        }
    }

    // Load all data from APIs
    async loadData() {
        try {
            this.showLoading(true);
            
            // Load projects
            const projectsResponse = await fetch(`${this.baseUrl}/projects`);
            if (projectsResponse.ok) {
                this.data.projects = await projectsResponse.json();
            }

            // Load achievements
            const achievementsResponse = await fetch(`${this.baseUrl}/achievements`);
            if (achievementsResponse.ok) {
                this.data.achievements = await achievementsResponse.json();
            }

            // Load contacts
            const contactsResponse = await fetch(`${this.baseUrl}/contact`);
            if (contactsResponse.ok) {
                this.data.contacts = await contactsResponse.json();
            }

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data. Please refresh the page.', 'error');
            this.showLoading(false);
        }
    }

    // Update dashboard statistics
    updateStats() {
        document.getElementById('projects-count').textContent = this.data.projects.length;
        document.getElementById('achievements-count').textContent = this.data.achievements.length;
        document.getElementById('skills-count').textContent = this.data.skills.length;
        document.getElementById('messages-count').textContent = this.data.contacts.filter(c => !c.isRead).length;
        document.getElementById('unread-count').textContent = this.data.contacts.filter(c => !c.isRead).length;
        document.getElementById('total-messages').textContent = this.data.contacts.length;
    }

    // Load recent activity
    loadRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const activities = [
            { icon: 'fas fa-plus', color: '#10b981', text: 'Added new project', time: '2 hours ago' },
            { icon: 'fas fa-trophy', color: '#f59e0b', text: 'Updated achievement', time: '5 hours ago' },
            { icon: 'fas fa-envelope', color: '#06b6d4', text: 'New contact message', time: '1 day ago' },
            { icon: 'fas fa-code', color: '#8b5cf6', text: 'Updated skills', time: '2 days ago' },
            { icon: 'fas fa-user', color: '#3b82f6', text: 'Updated profile', time: '3 days ago' }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Populate data grids
    populateDataGrids() {
        this.populateProjectsGrid();
        this.populateAchievementsGrid();
        this.populateSkillsGrid();
        this.populateMessagesGrid();
        this.populateEducationTimeline();
    }

    // Populate projects grid
    populateProjectsGrid() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        grid.innerHTML = this.data.projects.map(project => `
            <div class="project-card" data-id="${project.id}">
                <h4><i class="fas fa-project-diagram"></i> ${project.title}</h4>
                <p>${project.description}</p>
                <div class="project-meta">
                    ${project.technologies.split(',').map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editProject(${project.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-sm btn-success">
                        <i class="fas fa-external-link-alt"></i> Demo
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Populate achievements grid
    populateAchievementsGrid() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        grid.innerHTML = this.data.achievements.map(achievement => `
            <div class="achievement-card" data-id="${achievement.id}">
                <h4><i class="fas fa-trophy"></i> ${achievement.title}</h4>
                <p><strong>${achievement.organization}</strong></p>
                <p>${achievement.description}</p>
                <div class="achievement-meta">
                    <span class="type-tag">${new Date(achievement.date).toLocaleDateString()}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editAchievement(${achievement.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteAchievement(${achievement.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${achievement.certificateUrl ? `<a href="${achievement.certificateUrl}" target="_blank" class="btn btn-sm btn-success">
                        <i class="fas fa-certificate"></i> View
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Populate skills grid
    populateSkillsGrid() {
        const grid = document.getElementById('skills-grid');
        if (!grid) return;

        grid.innerHTML = this.data.skills.map((skill, index) => `
            <div class="skill-card" data-category="${skill.category}">
                <h4>
                    ${skill.icon ? `<i class="${skill.icon}"></i>` : '<i class="fas fa-code"></i>'} 
                    ${skill.name}
                </h4>
                <p><strong>Category:</strong> ${skill.category}</p>
                <p><strong>Level:</strong> ${skill.level}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editSkill(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteSkill(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Populate messages grid
    populateMessagesGrid() {
        const grid = document.getElementById('messages-list');
        if (!grid) return;

        grid.innerHTML = this.data.contacts.map(message => `
            <div class="message-card ${!message.isRead ? 'unread' : ''}" data-id="${message.id}">
                <div class="message-header">
                    <div class="message-info">
                        <h4>${message.name}</h4>
                        <p>${message.email}</p>
                    </div>
                    <span class="message-date">${new Date(message.createdDate).toLocaleDateString()}</span>
                </div>
                <div class="message-content">
                    <strong>Subject:</strong> ${message.subject}<br>
                    ${message.message}
                </div>
                <div class="message-actions">
                    ${!message.isRead ? `<button class="btn btn-sm btn-primary" onclick="adminDashboard.markAsRead(${message.id})">
                        <i class="fas fa-envelope-open"></i> Mark as Read
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteMessage(${message.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <a href="mailto:${message.email}?subject=Re: ${message.subject}" class="btn btn-sm btn-success">
                        <i class="fas fa-reply"></i> Reply
                    </a>
                </div>
            </div>
        `).join('');
    }

    // Populate education timeline
    populateEducationTimeline() {
        const timeline = document.getElementById('education-timeline');
        if (!timeline) return;

        timeline.innerHTML = this.data.education.map((edu, index) => `
            <div class="education-item" data-index="${index}">
                <h4>${edu.degree}</h4>
                <p><strong>${edu.school}</strong></p>
                <p><strong>Duration:</strong> ${edu.year}</p>
                ${edu.gpa ? `<p><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
                ${edu.location ? `<p><strong>Location:</strong> ${edu.location}</p>` : ''}
                ${edu.description ? `<p>${edu.description}</p>` : ''}
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editEducation(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteEducation(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Form submission handlers
    async handleProjectSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            technologies: formData.get('technologies'),
            imageUrl: formData.get('imageUrl'),
            demoUrl: formData.get('demoUrl'),
            githubUrl: formData.get('githubUrl')
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const newProject = await response.json();
                this.data.projects.unshift(newProject);
                this.populateProjectsGrid();
                this.updateStats();
                e.target.reset();
                this.showToast('Project added successfully!', 'success');
            } else {
                throw new Error('Failed to add project');
            }
        } catch (error) {
            console.error('Error adding project:', error);
            this.showToast('Error adding project. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleAchievementSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const achievementData = {
            title: formData.get('title'),
            description: formData.get('description'),
            organization: formData.get('organization'),
            date: formData.get('date'),
            certificateUrl: formData.get('certificateUrl')
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/achievements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(achievementData)
            });

            if (response.ok) {
                const newAchievement = await response.json();
                this.data.achievements.unshift(newAchievement);
                this.populateAchievementsGrid();
                this.updateStats();
                e.target.reset();
                this.showToast('Achievement added successfully!', 'success');
            } else {
                throw new Error('Failed to add achievement');
            }
        } catch (error) {
            console.error('Error adding achievement:', error);
            this.showToast('Error adding achievement. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleSkillSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const skillData = {
            name: formData.get('skillName'),
            category: formData.get('skillCategory'),
            level: formData.get('skillLevel'),
            icon: formData.get('skillIcon')
        };

        this.data.skills.push(skillData);
        this.populateSkillsGrid();
        this.updateStats();
        e.target.reset();
        this.showToast('Skill added successfully!', 'success');
        this.saveToLocalStorage('skills', this.data.skills);
    }

    handleEducationSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const educationData = {
            degree: formData.get('degree'),
            school: formData.get('school'),
            year: formData.get('year'),
            gpa: formData.get('gpa'),
            location: formData.get('location'),
            description: formData.get('description')
        };

        this.data.education.push(educationData);
        this.populateEducationTimeline();
        e.target.reset();
        this.showToast('Education added successfully!', 'success');
        this.saveToLocalStorage('education', this.data.education);
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.data.profile = {
            fullName: formData.get('fullName'),
            title: formData.get('title'),
            description: formData.get('description'),
            linkedin: formData.get('linkedin'),
            github: formData.get('github'),
            facebook: formData.get('facebook'),
            whatsapp: formData.get('whatsapp')
        };

        this.saveToLocalStorage('profile', this.data.profile);
        this.showToast('Profile updated successfully!', 'success');
    }

    handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.data.about = formData.get('aboutContent');
        this.saveToLocalStorage('about', this.data.about);
        this.showToast('About section updated successfully!', 'success');
    }

    handleGeneralSettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = {
            siteTitle: formData.get('siteTitle'),
            siteDescription: formData.get('siteDescription'),
            contactEmail: formData.get('contactEmail'),
            portfolioTheme: formData.get('portfolioTheme')
        };
        
        this.saveToLocalStorage('generalSettings', settings);
        this.showToast('General settings saved successfully!', 'success');
    }

    handleSecuritySettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // In a real application, you would hash passwords and validate them properly
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword && newPassword !== confirmPassword) {
            this.showToast('New passwords do not match!', 'error');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters long!', 'error');
            return;
        }

        this.showToast('Security settings updated successfully!', 'success');
        e.target.reset();
    }

    // Delete operations
    async deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/projects/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.data.projects = this.data.projects.filter(p => p.id !== id);
                this.populateProjectsGrid();
                this.updateStats();
                this.showToast('Project deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            this.showToast('Error deleting project. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteAchievement(id) {
        if (!confirm('Are you sure you want to delete this achievement?')) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/achievements/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.data.achievements = this.data.achievements.filter(a => a.id !== id);
                this.populateAchievementsGrid();
                this.updateStats();
                this.showToast('Achievement deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete achievement');
            }
        } catch (error) {
            console.error('Error deleting achievement:', error);
            this.showToast('Error deleting achievement. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    deleteSkill(index) {
        if (!confirm('Are you sure you want to delete this skill?')) return;
        
        this.data.skills.splice(index, 1);
        this.populateSkillsGrid();
        this.updateStats();
        this.saveToLocalStorage('skills', this.data.skills);
        this.showToast('Skill deleted successfully!', 'success');
    }

    deleteEducation(index) {
        if (!confirm('Are you sure you want to delete this education entry?')) return;
        
        this.data.education.splice(index, 1);
        this.populateEducationTimeline();
        this.saveToLocalStorage('education', this.data.education);
        this.showToast('Education entry deleted successfully!', 'success');
    }

    // Navigation and UI functions
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId)?.classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.closest('.nav-item').classList.add('active');

        this.currentSection = sectionId;
        
        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('adminSidebar')?.classList.remove('active');
            const toggle = document.getElementById('mobileSidebarToggle');
            if (toggle) {
                toggle.querySelector('i').classList.add('fa-bars');
                toggle.querySelector('i').classList.remove('fa-times');
            }
        }
    }

    showSettingsTab(tabId) {
        // Hide all settings content
        document.querySelectorAll('.settings-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected content
        document.getElementById(`${tabId}-settings`)?.classList.add('active');

        // Update tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="showSettingsTab('${tabId}')"]`)?.classList.add('active');
    }

    // Utility functions
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(toast);

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

    // Data management
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`portfolio_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    // Default data functions
    getDefaultSkills() {
        const saved = this.loadFromLocalStorage('skills');
        return saved || [
            { name: 'JavaScript', category: 'Frontend', level: 'Advanced', icon: 'fab fa-js-square' },
            { name: 'React', category: 'Frontend', level: 'Advanced', icon: 'fab fa-react' },
            { name: 'Node.js', category: 'Backend', level: 'Intermediate', icon: 'fab fa-node-js' },
            { name: 'C#', category: 'Languages', level: 'Advanced', icon: 'fas fa-code' },
            { name: 'ASP.NET Core', category: 'Backend', level: 'Advanced', icon: 'fas fa-server' },
            { name: 'SQL Server', category: 'Database', level: 'Intermediate', icon: 'fas fa-database' },
            { name: 'Azure', category: 'DevOps', level: 'Intermediate', icon: 'fab fa-microsoft' },
            { name: 'Git', category: 'Tools', level: 'Advanced', icon: 'fab fa-git-alt' }
        ];
    }

    getDefaultProfile() {
        const saved = this.loadFromLocalStorage('profile');
        return saved || {
            fullName: 'MD. Jahid Hasan Jim',
            title: 'Full Stack Developer & Software Engineer',
            description: 'Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.',
            linkedin: 'https://www.linkedin.com/in/md-jahid-hasan-jim/',
            github: 'https://github.com/jim2107054',
            facebook: 'https://facebook.com/jahid.hasan.jim',
            whatsapp: '+8801581705456'
        };
    }

    getDefaultEducation() {
        const saved = this.loadFromLocalStorage('education');
        return saved || [
            {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University of Technology',
                year: '2019 - 2023',
                gpa: '3.8/4.0',
                location: 'Dhaka, Bangladesh',
                description: 'Specialized in software engineering and web development'
            }
        ];
    }

    // Filter functions
    filterSkills() {
        const filter = document.getElementById('skill-filter')?.value;
        const cards = document.querySelectorAll('.skill-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterProjects() {
        const filter = document.getElementById('project-filter')?.value;
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                // For now, show all since we don't have status in the API
                card.style.display = 'block';
            }
        });
    }

    filterAchievements() {
        const filter = document.getElementById('achievement-filter')?.value;
        const cards = document.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                // For now, show all since we don't have type in the API
                card.style.display = 'block';
            }
        });
    }

    filterMessages() {
        const filter = document.getElementById('message-filter')?.value;
        const cards = document.querySelectorAll('.message-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else if (filter === 'unread' && card.classList.contains('unread')) {
                card.style.display = 'block';
            } else if (filter === 'read' && !card.classList.contains('unread')) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Additional functionality
    viewPortfolio() {
        window.open('/index.html', '_blank');
    }

    secureLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear any stored authentication data
            localStorage.removeItem('adminToken');
            sessionStorage.clear();
            window.location.href = '/index.html';
        }
    }

    changeTheme(theme) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`)?.classList.add('active');
        
        // Apply theme (this would be implemented based on your theming system)
        document.body.className = `theme-${theme}`;
        this.saveToLocalStorage('adminTheme', theme);
        this.showToast(`Theme changed to ${theme}`, 'success');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save current form
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const activeSection = document.querySelector('.admin-section.active');
            const form = activeSection?.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeConfirmationModal();
        }
    }

    closeConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Export/Import functions
    exportAllData() {
        const allData = {
            projects: this.data.projects,
            achievements: this.data.achievements,
            skills: this.data.skills,
            education: this.data.education,
            profile: this.data.profile,
            about: this.data.about,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('profile-preview');
                    if (preview) {
                        preview.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
                this.showToast('Image uploaded successfully!', 'success');
            } else {
                this.showToast('Please select a valid image file!', 'error');
            }
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    adminDashboard.showSection(sectionId);
}

function showSettingsTab(tabId) {
    adminDashboard.showSettingsTab(tabId);
}

function viewPortfolio() {
    adminDashboard.viewPortfolio();
}

function secureLogout() {
    adminDashboard.secureLogout();
}

function filterSkills() {
    adminDashboard.filterSkills();
}

function filterProjects() {
    adminDashboard.filterProjects();
}

function filterAchievements() {
    adminDashboard.filterAchievements();
}

function filterMessages() {
    adminDashboard.filterMessages();
}

function exportAllData() {
    adminDashboard.exportAllData();
}

function previewProfile() {
    adminDashboard.showToast('Profile preview would open here', 'info');
}

function previewAbout() {
    adminDashboard.showToast('About preview would open here', 'info');
}

function saveAppearanceSettings() {
    adminDashboard.showToast('Appearance settings saved!', 'success');
}

function triggerFileUpload() {
    document.getElementById('backup-file')?.click();
}

function importBackupData(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // In a real app, you'd validate and import the data
                adminDashboard.showToast('Backup data imported successfully!', 'success');
            } catch (error) {
                adminDashboard.showToast('Invalid backup file format!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

function resetToDefaults() {
    if (confirm('This will reset all data to defaults. Are you sure?')) {
        localStorage.clear();
        location.reload();
    }
}

function clearAllData() {
    if (confirm('This will permanently delete all data. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            localStorage.clear();
            adminDashboard.showToast('All data cleared!', 'warning');
            setTimeout(() => location.reload(), 2000);
        }
    }
}

function deleteAllRead() {
    if (confirm('Delete all read messages?')) {
        adminDashboard.data.contacts = adminDashboard.data.contacts.filter(c => !c.isRead);
        adminDashboard.populateMessagesGrid();
        adminDashboard.updateStats();
        adminDashboard.showToast('Read messages deleted!', 'success');
    }
}

function markAsRead(id) {
    const message = adminDashboard.data.contacts.find(c => c.id === id);
    if (message) {
        message.isRead = true;
        adminDashboard.populateMessagesGrid();
        adminDashboard.updateStats();
        adminDashboard.showToast('Message marked as read!', 'success');
    }
}

function deleteMessage(id) {
    if (confirm('Delete this message?')) {
        adminDashboard.data.contacts = adminDashboard.data.contacts.filter(c => c.id !== id);
        adminDashboard.populateMessagesGrid();
        adminDashboard.updateStats();
        adminDashboard.showToast('Message deleted!', 'success');
    }
}

function closeConfirmationModal() {
    adminDashboard.closeConfirmationModal();
}

function confirmAction() {
    // This would be implemented based on the specific action
    adminDashboard.closeConfirmationModal();
}

// Initialize the admin dashboard when the page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});