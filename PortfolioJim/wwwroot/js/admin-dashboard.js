// Enhanced Admin Dashboard JavaScript with Portfolio Integration
class AdminDashboard {
    constructor() {
        this.baseUrl = '/api';
        this.isAuthenticated = false;
        this.currentSection = 'dashboard';
        this.portfolioData = {
            projects: [],
            achievements: [],
            contacts: [],
            skills: [],
            profile: null,
            education: []
        };
        this.originalData = {}; // Store original data for comparison
        this.hasUnsavedChanges = false;
        this.init();
    }

    // Initialize the dashboard
    async init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupAutoSave();
        await this.loadPortfolioData();
        this.updateStats();
        this.loadRecentActivity();
        this.populateDataGrids();
        this.loadFormData();
        this.setupRealtimeUpdates();
        this.initializeNotifications();
    }

    checkAuthentication() {
        // Check if user is authenticated
        const session = localStorage.getItem('adminSession');
        if (!session) {
            this.redirectToPortfolio();
            return;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            if (sessionData.expires <= now) {
                localStorage.removeItem('adminSession');
                this.redirectToPortfolio();
                return;
            }
            
            this.isAuthenticated = true;
            this.currentUser = sessionData.user;
        } catch (error) {
            console.error('Invalid session data:', error);
            this.redirectToPortfolio();
        }
    }

    redirectToPortfolio() {
        this.showToast('Please login to access admin dashboard', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html?admin=true';
        }, 2000);
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

        // Auto-save on form changes
        document.querySelectorAll('form input, form textarea, form select').forEach(input => {
            input.addEventListener('change', () => this.markUnsavedChanges());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });

        // Navigation hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashNavigation();
        });

        // Session management
        this.setupSessionManagement();
    }

    setupSessionManagement() {
        // Auto-extend session on activity
        let activityTimer;
        ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                clearTimeout(activityTimer);
                activityTimer = setTimeout(() => {
                    this.extendSession();
                }, 5 * 60 * 1000); // Extend after 5 minutes of activity
            });
        });

        // Check session validity every minute
        setInterval(() => {
            this.checkSessionValidity();
        }, 60 * 1000);
    }

    extendSession() {
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                sessionData.expires = new Date().getTime() + (24 * 60 * 60 * 1000); // Extend by 24 hours
                localStorage.setItem('adminSession', JSON.stringify(sessionData));
            } catch (error) {
                console.error('Error extending session:', error);
            }
        }
    }

    checkSessionValidity() {
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                const timeLeft = sessionData.expires - now;
                
                // Warn user when 5 minutes left
                if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
                    this.showToast('Session will expire in 5 minutes', 'warning');
                }
                
                // Auto-logout when session expires
                if (timeLeft <= 0) {
                    this.handleSessionExpired();
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        }
    }

    handleSessionExpired() {
        this.showToast('Session expired. Redirecting to login...', 'error');
        localStorage.removeItem('adminSession');
        setTimeout(() => {
            window.location.href = 'index.html?admin=true';
        }, 2000);
    }

    setupAutoSave() {
        // Auto-save draft data every 30 seconds
        setInterval(() => {
            if (this.hasUnsavedChanges) {
                this.saveDraft();
            }
        }, 30 * 1000);
    }

    setupRealtimeUpdates() {
        // Listen for data updates from portfolio
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolioData') {
                this.handlePortfolioDataUpdate();
            }
        });

        // Setup portfolio communication
        this.setupPortfolioCommunication();
    }

    setupPortfolioCommunication() {
        // Send updates to portfolio when data changes
        window.addEventListener('beforeunload', () => {
            this.notifyPortfolioUpdate();
        });

        // Listen for messages from portfolio
        window.addEventListener('message', (e) => {
            if (e.data.type === 'portfolioRequest') {
                this.handlePortfolioRequest(e.data);
            }
        });
    }

    notifyPortfolioUpdate() {
        // Notify portfolio of data changes
        try {
            // Update localStorage with current data
            localStorage.setItem('portfolioData', JSON.stringify(this.portfolioData));
            
            // Send message to portfolio window if open
            const portfolioWindow = window.opener || window.parent;
            if (portfolioWindow && portfolioWindow !== window) {
                portfolioWindow.postMessage({
                    type: 'adminDataUpdate',
                    data: this.portfolioData
                }, window.location.origin);
            }

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('adminDataUpdate', {
                detail: this.portfolioData
            }));
        } catch (error) {
            console.error('Error notifying portfolio update:', error);
        }
    }

    handlePortfolioRequest(data) {
        switch (data.action) {
            case 'getData':
                this.sendPortfolioData();
                break;
            case 'refreshData':
                this.loadPortfolioData();
                break;
        }
    }

    sendPortfolioData() {
        const portfolioWindow = window.opener || window.parent;
        if (portfolioWindow && portfolioWindow !== window) {
            portfolioWindow.postMessage({
                type: 'adminDataResponse',
                data: this.portfolioData
            }, window.location.origin);
        }
    }

    handleHashNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.showSection(hash);
        }
    }

    // Setup mobile menu functionality
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileSidebarToggle');
        const sidebar = document.getElementById('adminSidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !sidebar.contains(e.target) && 
                    !mobileToggle.contains(e.target) && 
                    sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    const icon = mobileToggle.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        }
    }

    initializeNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotification(title, message, type = 'info') {
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
            });

            setTimeout(() => notification.close(), 5000);
        }

        // Also show toast
        this.showToast(message, type);
    }

    // Load all data from APIs and localStorage
    async loadPortfolioData() {
        try {
            this.showLoading(true);
            
            // Load from localStorage first (fastest)
            const cachedData = this.loadCachedData();
            if (cachedData) {
                this.portfolioData = { ...this.portfolioData, ...cachedData };
                this.originalData = JSON.parse(JSON.stringify(this.portfolioData));
            }

            // Try to load from API
            await this.loadFromAPI();
            
            // Load draft data if available
            this.loadDraftData();
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showToast('Error loading data. Using cached version.', 'warning');
            this.showLoading(false);
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

    async loadFromAPI() {
        try {
            const endpoints = [
                { key: 'profile', url: `${this.baseUrl}/profile` },
                { key: 'skills', url: `${this.baseUrl}/skills` },
                { key: 'projects', url: `${this.baseUrl}/projects` },
                { key: 'education', url: `${this.baseUrl}/education` },
                { key: 'achievements', url: `${this.baseUrl}/achievements` },
                { key: 'contacts', url: `${this.baseUrl}/contact` }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => 
                    fetch(endpoint.url).then(res => res.ok ? res.json() : null)
                )
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    this.portfolioData[endpoints[index].key] = result.value;
                }
            });

            // Cache the loaded data
            this.cacheData();
            this.originalData = JSON.parse(JSON.stringify(this.portfolioData));
        } catch (error) {
            console.warn('API not available, using cached data');
        }
    }

    loadDraftData() {
        try {
            const drafts = JSON.parse(localStorage.getItem('adminDrafts') || '{}');
            Object.keys(drafts).forEach(key => {
                if (drafts[key] && this.portfolioData[key]) {
                    this.portfolioData[key] = { ...this.portfolioData[key], ...drafts[key] };
                }
            });
        } catch (error) {
            console.error('Error loading draft data:', error);
        }
    }

    saveDraft() {
        try {
            const drafts = JSON.parse(localStorage.getItem('adminDrafts') || '{}');
            
            // Compare with original data to identify changes
            Object.keys(this.portfolioData).forEach(key => {
                if (JSON.stringify(this.portfolioData[key]) !== JSON.stringify(this.originalData[key])) {
                    drafts[key] = this.portfolioData[key];
                }
            });

            localStorage.setItem('adminDrafts', JSON.stringify(drafts));
            this.showToast('Draft saved automatically', 'info');
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    clearDrafts() {
        localStorage.removeItem('adminDrafts');
        this.hasUnsavedChanges = false;
    }

    cacheData() {
        try {
            localStorage.setItem('portfolioData', JSON.stringify(this.portfolioData));
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }

    markUnsavedChanges() {
        this.hasUnsavedChanges = true;
        this.updateUnsavedIndicator();
    }

    markSavedChanges() {
        this.hasUnsavedChanges = false;
        this.updateUnsavedIndicator();
        this.clearDrafts();
    }

    updateUnsavedIndicator() {
        // Add/remove indicator in the header
        let indicator = document.querySelector('.unsaved-indicator');
        
        if (this.hasUnsavedChanges && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'unsaved-indicator';
            indicator.innerHTML = '<i class="fas fa-circle"></i> Unsaved changes';
            indicator.title = 'You have unsaved changes';
            
            const adminNav = document.querySelector('.admin-nav');
            if (adminNav) {
                adminNav.appendChild(indicator);
            }
        } else if (!this.hasUnsavedChanges && indicator) {
            indicator.remove();
        }
    }

    // Load form data from portfolio data
    loadFormData() {
        if (this.portfolioData.profile) {
            this.populateProfileForm();
            this.populateAboutForm();
        }
    }

    populateProfileForm() {
        const profile = this.portfolioData.profile;
        const fields = {
            'full-name': profile.fullName,
            'title': profile.title,
            'description': profile.description,
            'linkedin': profile.linkedInUrl,
            'github': profile.gitHubUrl,
            'facebook': profile.facebookUrl,
            'whatsapp': profile.whatsAppNumber
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });

        // Update profile image preview
        if (profile.profileImageUrl) {
            const preview = document.getElementById('profile-preview');
            if (preview) {
                preview.src = profile.profileImageUrl;
            }
        }
    }

    populateAboutForm() {
        const aboutContent = document.getElementById('about-content');
        if (aboutContent && this.portfolioData.profile?.aboutContent) {
            aboutContent.value = this.portfolioData.profile.aboutContent;
        }
    }

    // Update dashboard statistics
    updateStats() {
        const stats = {
            'projects-count': this.portfolioData.projects.length,
            'achievements-count': this.portfolioData.achievements.length,
            'skills-count': this.portfolioData.skills.length,
            'messages-count': this.portfolioData.contacts.filter(c => !c.isRead).length,
            'unread-count': this.portfolioData.contacts.filter(c => !c.isRead).length,
            'total-messages': this.portfolioData.contacts.length
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCounter(element, parseInt(element.textContent) || 0, value);
            }
        });
    }

    animateCounter(element, start, end) {
        const duration = 1000;
        const increment = (end - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Load recent activity
    loadRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const activities = [];
        
        // Add recent projects
        this.portfolioData.projects.slice(0, 2).forEach(project => {
            activities.push({
                icon: 'fas fa-plus',
                color: '#10b981',
                text: `Added project: ${project.title}`,
                time: this.getRelativeTime(project.createdDate || new Date())
            });
        });

        // Add recent achievements
        this.portfolioData.achievements.slice(0, 2).forEach(achievement => {
            activities.push({
                icon: 'fas fa-trophy',
                color: '#f59e0b',
                text: `Added achievement: ${achievement.title}`,
                time: this.getRelativeTime(achievement.date)
            });
        });

        // Add recent messages
        this.portfolioData.contacts.slice(0, 1).forEach(contact => {
            activities.push({
                icon: 'fas fa-envelope',
                color: '#06b6d4',
                text: `New message from ${contact.name}`,
                time: this.getRelativeTime(contact.createdDate || new Date())
            });
        });

        // Sort by most recent
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

    // Enhanced populate projects grid
    populateProjectsGrid() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        grid.innerHTML = this.portfolioData.projects.map(project => `
            <div class="project-card" data-id="${project.id}" data-status="${project.status}" data-category="${project.category}">
                <div class="project-header">
                    <h4><i class="fas fa-project-diagram"></i> ${project.title}</h4>
                    <span class="status-badge status-${(project.status || 'completed').toLowerCase().replace(' ', '-')}">${project.status || 'Completed'}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="tech-tags">
                        ${(project.technologies || '').split(',').map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                    </div>
                    <div class="project-category">
                        <i class="fas fa-folder"></i> ${project.category || 'Web Development'}
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

        grid.innerHTML = this.portfolioData.achievements.map(achievement => `
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

        grid.innerHTML = this.portfolioData.skills.map(skill => `
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

        grid.innerHTML = this.portfolioData.contacts.map(message => `
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

        timeline.innerHTML = this.portfolioData.education.map(edu => `
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

    // Enhanced form submission handlers with better error handling and validation
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
            email: this.portfolioData.profile?.email || 'jahid.hasan.jim@gmail.com'
        };

        // Validate required fields
        if (!profileData.fullName || !profileData.title) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Update local data immediately for better UX
            this.portfolioData.profile = { ...this.portfolioData.profile, ...profileData };
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Try to save to API
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                this.markSavedChanges();
                this.showToast('Profile updated successfully!', 'success');
                this.showNotification('Profile Updated', 'Your profile information has been saved.');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Profile saved locally. Will sync when online.', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    async handleAboutSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const aboutData = {
            ...this.portfolioData.profile,
            aboutContent: formData.get('aboutContent')
        };

        if (!aboutData.aboutContent) {
            this.showToast('About content cannot be empty', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Update local data
            this.portfolioData.profile.aboutContent = aboutData.aboutContent;
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Try to save to API
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutData)
            });

            if (response.ok) {
                this.markSavedChanges();
                this.showToast('About section updated successfully!', 'success');
            } else {
                throw new Error('Failed to update about section');
            }
        } catch (error) {
            console.error('Error updating about section:', error);
            this.showToast('About section saved locally. Will sync when online.', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    // Enhanced skill submission with validation
    async handleSkillSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const skillData = {
            id: Date.now(), // Generate temporary ID
            name: formData.get('skillName'),
            category: formData.get('skillCategory'),
            level: formData.get('skillLevel'),
            iconClass: formData.get('skillIcon'),
            proficiencyPercentage: this.getLevelPercentage(formData.get('skillLevel')),
            yearsOfExperience: this.getLevelYears(formData.get('skillLevel')),
            createdDate: new Date().toISOString()
        };

        // Validation
        if (!skillData.name || !skillData.category || !skillData.level) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Check for duplicates
        if (this.portfolioData.skills.some(s => s.name.toLowerCase() === skillData.name.toLowerCase())) {
            this.showToast('Skill already exists', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Add to local data
            this.portfolioData.skills.push(skillData);
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Update UI
            this.populateSkillsGrid();
            this.updateStats();
            e.target.reset();
            
            // Try to save to API
            const response = await fetch(`${this.baseUrl}/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skillData)
            });

            if (response.ok) {
                const newSkill = await response.json();
                // Update with server-generated ID
                const index = this.portfolioData.skills.findIndex(s => s.id === skillData.id);
                if (index !== -1) {
                    this.portfolioData.skills[index] = newSkill;
                }
                this.markSavedChanges();
                this.showToast('Skill added successfully!', 'success');
            } else {
                throw new Error('Failed to add skill');
            }
        } catch (error) {
            console.error('Error adding skill:', error);
            this.showToast('Skill saved locally. Will sync when online.', 'warning');
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
                this.portfolioData.projects.unshift(newProject);
                this.populateProjectsGrid();
                this.updateStats();
                e.target.reset();
                this.showToast('Project added successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.achievements.unshift(newAchievement);
                this.populateAchievementsGrid();
                this.updateStats();
                e.target.reset();
                this.showToast('Achievement added successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.education.push(newEducation);
                this.populateEducationTimeline();
                e.target.reset();
                this.showToast('Education added successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.projects = this.portfolioData.projects.filter(p => p.id !== id);
                this.populateProjectsGrid();
                this.updateStats();
                this.showToast('Project deleted successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.achievements = this.portfolioData.achievements.filter(a => a.id !== id);
                this.populateAchievementsGrid();
                this.updateStats();
                this.showToast('Achievement deleted successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.skills = this.portfolioData.skills.filter(s => s.id !== id);
                this.populateSkillsGrid();
                this.updateStats();
                this.showToast('Skill deleted successfully!', 'success');
                this.notifyPortfolioUpdate();
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
                this.portfolioData.education = this.portfolioData.education.filter(e => e.id !== id);
                this.populateEducationTimeline();
                this.showToast('Education entry deleted successfully!', 'success');
                this.notifyPortfolioUpdate();
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
            const message = this.portfolioData.contacts.find(c => c.id === id);
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
                    this.notifyPortfolioUpdate();
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
                this.portfolioData.contacts = this.portfolioData.contacts.filter(c => c.id !== id);
                this.populateMessagesGrid();
                this.updateStats();
                this.showToast('Message deleted!', 'success');
                this.notifyPortfolioUpdate();
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

    // Navigation and UI functions with enhanced features
    showSection(sectionId) {
        // Save current section state
        if (this.currentSection !== sectionId && this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Continue without saving?')) {
                return;
            }
        }

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Add entrance animation
            targetSection.style.opacity = '0';
            targetSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.closest('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Update URL hash
        if (window.location.hash !== `#${sectionId}`) {
            window.history.replaceState(null, null, `#${sectionId}`);
        }
        
        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('adminSidebar')?.classList.remove('active');
            const toggle = document.getElementById('mobileSidebarToggle');
            if (toggle) {
                const icon = toggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
        
        // Log section visit
        this.logActivity('navigation', `Navigated to ${sectionId} section`);
        
        // Load section-specific data if needed
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadRecentActivity();
                this.updateStats();
                break;
            case 'projects':
                this.populateProjectsGrid();
                break;
            case 'achievements':
                this.populateAchievementsGrid();
                break;
            case 'skills':
                this.populateSkillsGrid();
                break;
            case 'contacts':
                this.populateMessagesGrid();
                break;
            case 'education':
                this.populateEducationTimeline();
                break;
        }
    }

    // Utility functions with enhanced error handling
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
                overlay.style.zIndex = '10000';
            } else {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.style.zIndex = '9999';
                }, 300);
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
                <button class="toast-close" onclick="this.closest('.toast').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Add entrance animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);

        // Clear auto-remove if user manually closes
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
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
}

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    adminDashboard.showSection(sectionId);
}

function showSettingsTab(tabId) {
    adminDashboard.showSettingsTab(tabId);
}

function viewPortfolio() {
    window.open('index.html', '_blank');
}

function secureLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html';
    }
}

// Initialize the admin dashboard when the page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
    
    // Make it globally accessible
    window.adminDashboard = adminDashboard;
});

// Handle page visibility changes to auto-save
document.addEventListener('visibilitychange', () => {
    if (document.hidden && adminDashboard?.hasUnsavedChanges) {
        adminDashboard.saveDraft();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}