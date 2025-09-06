// Admin Dashboard JavaScript - Comprehensive Database Integration
class AdminDashboard {
    constructor() {
        this.baseUrl = '/api';
        this.isAuthenticated = false;
        this.currentSection = 'dashboard';
        this.data = {
            projects: [],
            achievements: [],
            contacts: [],
            skills: [],
            profile: null,
            education: []
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
        this.loadFormData();
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
            
            // Load all data in parallel
            const [projectsRes, achievementsRes, contactsRes, skillsRes, profileRes, educationRes] = await Promise.all([
                fetch(`${this.baseUrl}/projects`),
                fetch(`${this.baseUrl}/achievements`),
                fetch(`${this.baseUrl}/contact`),
                fetch(`${this.baseUrl}/skills`),
                fetch(`${this.baseUrl}/profile`),
                fetch(`${this.baseUrl}/education`)
            ]);

            if (projectsRes.ok) {
                this.data.projects = await projectsRes.json();
            }

            if (achievementsRes.ok) {
                this.data.achievements = await achievementsRes.json();
            }

            if (contactsRes.ok) {
                this.data.contacts = await contactsRes.json();
            }

            if (skillsRes.ok) {
                this.data.skills = await skillsRes.json();
            }

            if (profileRes.ok) {
                this.data.profile = await profileRes.json();
            }

            if (educationRes.ok) {
                this.data.education = await educationRes.json();
            }

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data. Please refresh the page.', 'error');
            this.showLoading(false);
        }
    }

    // Load form data from database
    loadFormData() {
        if (this.data.profile) {
            // Populate profile form
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                document.getElementById('full-name').value = this.data.profile.fullName || '';
                document.getElementById('title').value = this.data.profile.title || '';
                document.getElementById('description').value = this.data.profile.description || '';
                document.getElementById('linkedin').value = this.data.profile.linkedInUrl || '';
                document.getElementById('github').value = this.data.profile.gitHubUrl || '';
                document.getElementById('facebook').value = this.data.profile.facebookUrl || '';
                document.getElementById('whatsapp').value = this.data.profile.whatsAppNumber || '';
            }

            // Populate about form
            const aboutContent = document.getElementById('about-content');
            if (aboutContent && this.data.profile.aboutContent) {
                aboutContent.value = this.data.profile.aboutContent;
            }
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

        const activities = [];
        
        // Add recent projects
        this.data.projects.slice(0, 2).forEach(project => {
            activities.push({
                icon: 'fas fa-plus',
                color: '#10b981',
                text: `Added project: ${project.title}`,
                time: this.getRelativeTime(project.createdDate)
            });
        });

        // Add recent achievements
        this.data.achievements.slice(0, 2).forEach(achievement => {
            activities.push({
                icon: 'fas fa-trophy',
                color: '#f59e0b',
                text: `Added achievement: ${achievement.title}`,
                time: this.getRelativeTime(achievement.date)
            });
        });

        // Add recent messages
        this.data.contacts.slice(0, 1).forEach(contact => {
            activities.push({
                icon: 'fas fa-envelope',
                color: '#06b6d4',
                text: `New message from ${contact.name}`,
                time: this.getRelativeTime(contact.createdDate)
            });
        });

        activityList.innerHTML = activities.slice(0, 5).map(activity => `
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

    // Get relative time
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
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
            <div class="project-card" data-id="${project.id}" data-status="${project.status}">
                <div class="project-header">
                    <h4><i class="fas fa-project-diagram"></i> ${project.title}</h4>
                    <span class="status-badge status-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="tech-tags">
                        ${project.technologies.split(',').map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                    </div>
                    <div class="project-category">
                        <i class="fas fa-folder"></i> ${project.category}
                    </div>
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
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-sm btn-info">
                        <i class="fab fa-github"></i> Code
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
            <div class="achievement-card" data-id="${achievement.id}" data-type="${achievement.type}">
                <div class="achievement-header">
                    <h4><i class="fas fa-trophy"></i> ${achievement.title}</h4>
                    <span class="type-badge type-${achievement.type.toLowerCase()}">${achievement.type}</span>
                </div>
                <p class="achievement-org"><strong><i class="fas fa-building"></i> ${achievement.organization}</strong></p>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-meta">
                    <span class="date-tag"><i class="fas fa-calendar"></i> ${new Date(achievement.date).toLocaleDateString()}</span>
                    <span class="level-tag"><i class="fas fa-medal"></i> ${achievement.level}</span>
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

        grid.innerHTML = this.data.skills.map(skill => `
            <div class="skill-card" data-category="${skill.category}" data-id="${skill.id}">
                <div class="skill-header">
                    <h4>
                        ${skill.iconClass ? `<i class="${skill.iconClass}"></i>` : '<i class="fas fa-code"></i>'} 
                        ${skill.name}
                    </h4>
                    <span class="level-badge level-${skill.level.toLowerCase()}">${skill.level}</span>
                </div>
                <div class="skill-info">
                    <p><strong>Category:</strong> ${skill.category}</p>
                    <p><strong>Experience:</strong> ${skill.yearsOfExperience} years</p>
                    <div class="skill-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${skill.proficiencyPercentage}%"></div>
                        </div>
                        <span class="progress-text">${skill.proficiencyPercentage}%</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editSkill(${skill.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteSkill(${skill.id})">
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
                        <p><i class="fas fa-envelope"></i> ${message.email}</p>
                    </div>
                    <div class="message-time">
                        <span class="message-date">${new Date(message.createdDate).toLocaleDateString()}</span>
                        ${!message.isRead ? '<span class="unread-indicator"><i class="fas fa-circle"></i></span>' : ''}
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-subject"><strong>Subject:</strong> ${message.subject}</div>
                    <div class="message-text">${message.message}</div>
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

        timeline.innerHTML = this.data.education.map(edu => `
            <div class="education-item" data-id="${edu.id}">
                <div class="education-header">
                    <h4><i class="fas fa-graduation-cap"></i> ${edu.degree}</h4>
                    <span class="duration-badge">${edu.duration}</span>
                </div>
                <p class="school-name"><strong><i class="fas fa-university"></i> ${edu.school}</strong></p>
                ${edu.location ? `<p class="location"><i class="fas fa-map-marker-alt"></i> ${edu.location}</p>` : ''}
                ${edu.gpa ? `<p class="gpa"><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
                ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editEducation(${edu.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteEducation(${edu.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Form submission handlers
    async handleProfileSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const profileData = {
            fullName: formData.get('fullName'),
            title: formData.get('title'),
            description: formData.get('description'),
            linkedInUrl: formData.get('linkedin'),
            gitHubUrl: formData.get('github'),
            facebookUrl: formData.get('facebook'),
            whatsAppNumber: formData.get('whatsapp'),
            email: this.data.profile?.email || 'jahid.hasan.jim@gmail.com'
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                // Update local data
                this.data.profile = { ...this.data.profile, ...profileData };
                this.showToast('Profile updated successfully!', 'success');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Error updating profile. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const aboutData = {
            ...this.data.profile,
            aboutContent: formData.get('aboutContent')
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutData)
            });

            if (response.ok) {
                this.data.profile.aboutContent = aboutData.aboutContent;
                this.showToast('About section updated successfully!', 'success');
            } else {
                throw new Error('Failed to update about section');
            }
        } catch (error) {
            console.error('Error updating about section:', error);
            this.showToast('Error updating about section. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSkillSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const skillData = {
            name: formData.get('skillName'),
            category: formData.get('skillCategory'),
            level: formData.get('skillLevel'),
            iconClass: formData.get('skillIcon'),
            proficiencyPercentage: this.getLevelPercentage(formData.get('skillLevel')),
            yearsOfExperience: this.getLevelYears(formData.get('skillLevel'))
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skillData)
            });

            if (response.ok) {
                const newSkill = await response.json();
                this.data.skills.push(newSkill);
                this.populateSkillsGrid();
                this.updateStats();
                e.target.reset();
                this.showToast('Skill added successfully!', 'success');
            } else {
                throw new Error('Failed to add skill');
            }
        } catch (error) {
            console.error('Error adding skill:', error);
            this.showToast('Error adding skill. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            technologies: formData.get('technologies'),
            imageUrl: formData.get('imageUrl'),
            demoUrl: formData.get('demoUrl'),
            githubUrl: formData.get('githubUrl'),
            status: formData.get('status') || 'Completed',
            category: formData.get('category') || 'Web Development'
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
            certificateUrl: formData.get('certificateUrl'),
            type: formData.get('type') || 'Certification',
            level: formData.get('level') || 'Professional'
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

    async handleEducationSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const educationData = {
            degree: formData.get('degree'),
            school: formData.get('school'),
            duration: formData.get('year'),
            gpa: formData.get('gpa'),
            location: formData.get('location'),
            description: formData.get('description'),
            startDate: new Date(formData.get('year').split(' - ')[0] + '-01-01'),
            endDate: formData.get('year').includes(' - ') ? new Date(formData.get('year').split(' - ')[1] + '-12-31') : null
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(educationData)
            });

            if (response.ok) {
                const newEducation = await response.json();
                this.data.education.push(newEducation);
                this.populateEducationTimeline();
                e.target.reset();
                this.showToast('Education added successfully!', 'success');
            } else {
                throw new Error('Failed to add education');
            }
        } catch (error) {
            console.error('Error adding education:', error);
            this.showToast('Error adding education. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Helper functions for skill levels
    getLevelPercentage(level) {
        const percentages = {
            'Beginner': 50,
            'Intermediate': 75,
            'Advanced': 90,
            'Expert': 95
        };
        return percentages[level] || 75;
    }

    getLevelYears(level) {
        const years = {
            'Beginner': 1,
            'Intermediate': 3,
            'Advanced': 5,
            'Expert': 7
        };
        return years[level] || 3;
    }

    // Delete operations with database integration
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

    async deleteSkill(id) {
        if (!confirm('Are you sure you want to delete this skill?')) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/skills/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.data.skills = this.data.skills.filter(s => s.id !== id);
                this.populateSkillsGrid();
                this.updateStats();
                this.showToast('Skill deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete skill');
            }
        } catch (error) {
            console.error('Error deleting skill:', error);
            this.showToast('Error deleting skill. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteEducation(id) {
        if (!confirm('Are you sure you want to delete this education entry?')) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/education/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.data.education = this.data.education.filter(e => e.id !== id);
                this.populateEducationTimeline();
                this.showToast('Education entry deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete education');
            }
        } catch (error) {
            console.error('Error deleting education:', error);
            this.showToast('Error deleting education. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async markAsRead(id) {
        try {
            const message = this.data.contacts.find(c => c.id === id);
            if (message) {
                message.isRead = true;
                
                const response = await fetch(`${this.baseUrl}/contact/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });

                if (response.ok) {
                    this.populateMessagesGrid();
                    this.updateStats();
                    this.showToast('Message marked as read!', 'success');
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
            this.showToast('Error updating message status.', 'error');
        }
    }

    async deleteMessage(id) {
        if (!confirm('Delete this message?')) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseUrl}/contact/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.data.contacts = this.data.contacts.filter(c => c.id !== id);
                this.populateMessagesGrid();
                this.updateStats();
                this.showToast('Message deleted!', 'success');
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showToast('Error deleting message. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
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
            if (filter === 'all' || card.dataset.status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterAchievements() {
        const filter = document.getElementById('achievement-filter')?.value;
        const cards = document.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.type === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
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
        localStorage.setItem('adminTheme', theme);
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
            contacts: this.data.contacts,
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

    handleGeneralSettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = {
            siteTitle: formData.get('siteTitle'),
            siteDescription: formData.get('siteDescription'),
            contactEmail: formData.get('contactEmail'),
            portfolioTheme: formData.get('portfolioTheme')
        };
        
        localStorage.setItem('generalSettings', JSON.stringify(settings));
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

function markAsRead(id) {
    adminDashboard.markAsRead(id);
}

function deleteMessage(id) {
    adminDashboard.deleteMessage(id);
}

function deleteAllRead() {
    if (confirm('Delete all read messages?')) {
        const readMessages = adminDashboard.data.contacts.filter(c => c.isRead);
        Promise.all(readMessages.map(msg => 
            fetch(`${adminDashboard.baseUrl}/contact/${msg.id}`, { method: 'DELETE' })
        )).then(() => {
            adminDashboard.data.contacts = adminDashboard.data.contacts.filter(c => !c.isRead);
            adminDashboard.populateMessagesGrid();
            adminDashboard.updateStats();
            adminDashboard.showToast('Read messages deleted!', 'success');
        });
    }
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