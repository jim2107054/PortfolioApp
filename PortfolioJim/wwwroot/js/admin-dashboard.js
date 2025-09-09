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
        this.loadSettings();
        await this.loadPortfolioData();
        this.updateStats();
        this.loadRecentActivity();
        this.populateDataGrids();
        this.loadFormData();
        this.setupRealtimeUpdates();
        this.initializeNotifications();
        this.logActivity('system', 'Admin dashboard initialized');
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
            console.log('Notifying portfolio of data update:', this.portfolioData);
            
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

            // Dispatch custom event for same-window communication
            window.dispatchEvent(new CustomEvent('adminDataUpdate', {
                detail: this.portfolioData
            }));

            // Also dispatch storage event manually for cross-tab communication
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolioData',
                newValue: JSON.stringify(this.portfolioData),
                oldValue: localStorage.getItem('portfolioData'),
                storageArea: localStorage
            }));

            // Update portfolio window directly if portfolioManager exists
            if (window.portfolioManager) {
                window.portfolioManager.handleDataUpdate(this.portfolioData);
            }
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
            description: formData.get('description',
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
            
            // Try to save using mock API
            if (window.mockAPI) {
                const result = await window.mockAPI.updateProfile(profileData);
                if (result) {
                    this.portfolioData.profile = result;
                }
            }
            
            this.markSavedChanges();
            this.showToast('Profile updated successfully!', 'success');
            this.showNotification('Profile Updated', 'Your profile information has been saved.');
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
            
            // Try to save using mock API
            if (window.mockAPI) {
                await window.mockAPI.updateProfile(aboutData);
            }
            
            this.markSavedChanges();
            this.showToast('About section updated successfully!', 'success');
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
            
            // Update UI immediately
            this.populateSkillsGrid();
            this.updateStats();
            e.target.reset();
            
            // Try to save using mock API
            if (window.mockAPI) {
                const newSkill = await window.mockAPI.addSkill(skillData);
                if (newSkill) {
                    // Update with server-generated ID
                    const index = this.portfolioData.skills.findIndex(s => s.id === skillData.id);
                    if (index !== -1) {
                        this.portfolioData.skills[index] = newSkill;
                        this.cacheData();
                        this.notifyPortfolioUpdate();
                    }
                }
            }
            
            this.markSavedChanges();
            this.showToast('Skill added successfully!', 'success');
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
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            technologies: formData.get('technologies'),
            imageUrl: formData.get('imageUrl'),
            demoUrl: formData.get('demoUrl'),
            githubUrl: formData.get('githubUrl'),
            status: formData.get('status') || 'Completed',
            category: formData.get('category') || 'Web Development',
            createdDate: new Date().toISOString()
        };

        // Validation
        if (!projectData.title || !projectData.description) {
            this.showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Add to local data immediately
            this.portfolioData.projects.unshift(projectData);
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Update UI
            this.populateProjectsGrid();
            this.updateStats();
            e.target.reset();
            
            // Try to save using mock API
            if (window.mockAPI) {
                const newProject = await window.mockAPI.addProject(projectData);
                if (newProject) {
                    // Update with server data
                    const index = this.portfolioData.projects.findIndex(p => p.id === projectData.id);
                    if (index !== -1) {
                        this.portfolioData.projects[index] = newProject;
                        this.cacheData();
                        this.notifyPortfolioUpdate();
                    }
                }
            }
            
            this.markSavedChanges();
            this.showToast('Project added successfully!', 'success');
        } catch (error) {
            console.error('Error adding project:', error);
            this.showToast('Project saved locally. Will sync when online.', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    async handleAchievementSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const achievementData = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            organization: formData.get('organization'),
            date: formData.get('date'),
            certificateUrl: formData.get('certificateUrl'),
            type: formData.get('type') || 'Certification',
            level: formData.get('level') || 'Professional',
            createdDate: new Date().toISOString()
        };

        // Validation
        if (!achievementData.title || !achievementData.organization || !achievementData.date) {
            this.showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Add to local data immediately
            this.portfolioData.achievements.unshift(achievementData);
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Update UI
            this.populateAchievementsGrid();
            this.updateStats();
            e.target.reset();
            
            // Try to save using mock API
            if (window.mockAPI) {
                const newAchievement = await window.mockAPI.addAchievement(achievementData);
                if (newAchievement) {
                    // Update with server data
                    const index = this.portfolioData.achievements.findIndex(a => a.id === achievementData.id);
                    if (index !== -1) {
                        this.portfolioData.achievements[index] = newAchievement;
                        this.cacheData();
                        this.notifyPortfolioUpdate();
                    }
                }
            }
            
            this.markSavedChanges();
            this.showToast('Achievement added successfully!', 'success');
        } catch (error) {
            console.error('Error adding achievement:', error);
            this.showToast('Achievement saved locally. Will sync when online.', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    async handleEducationSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const educationData = {
            id: Date.now(),
            degree: formData.get('degree'),
            school: formData.get('school'),
            duration: formData.get('year'),
            gpa: formData.get('gpa'),
            location: formData.get('location'),
            description: formData.get('description'),
            startDate: new Date(formData.get('year').split(' - ')[0] + '-01-01'),
            endDate: formData.get('year').includes(' - ') ? new Date(formData.get('year').split(' - ')[1] + '-12-31') : null,
            createdDate: new Date().toISOString()
        };

        // Validation
        if (!educationData.degree || !educationData.school || !educationData.duration) {
            this.showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // Add to local data immediately
            this.portfolioData.education.push(educationData);
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Update UI
            this.populateEducationTimeline();
            e.target.reset();
            
            // Try to save using mock API
            if (window.mockAPI) {
                const newEducation = await window.mockAPI.addEducation(educationData);
                if (newEducation) {
                    // Update with server data
                    const index = this.portfolioData.education.findIndex(ed => ed.id === educationData.id);
                    if (index !== -1) {
                        this.portfolioData.education[index] = newEducation;
                        this.cacheData();
                        this.notifyPortfolioUpdate();
                    }
                }
            }
            
            this.markSavedChanges();
            this.showToast('Education added successfully!', 'success');
        } catch (error) {
            console.error('Error adding education:', error);
            this.showToast('Education saved locally. Will sync when online.', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    // Enhanced settings management with additional features
    async handleGeneralSettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const settings = {
            siteTitle: formData.get('siteTitle'),
            siteDescription: formData.get('siteDescription'),
            contactEmail: formData.get('contactEmail'),
            portfolioTheme: formData.get('portfolioTheme')
        };

        try {
            this.showLoading(true);
            
            // Save settings locally
            localStorage.setItem('portfolioSettings', JSON.stringify(settings));
            
            // Apply theme immediately
            this.applyTheme(settings.portfolioTheme);
            
            this.showToast('General settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving general settings:', error);
            this.showToast('Error saving settings', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSecuritySettingsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        const adminEmail = formData.get('adminEmail');

        // Validation
        if (newPassword && newPassword !== confirmPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            // In a real app, you'd verify the current password with the server
            const securitySettings = {
                adminEmail: adminEmail,
                lastPasswordChange: new Date().toISOString(),
                autoLogout: formData.get('autoLogout') === 'on',
                rememberLogin: formData.get('rememberLogin') === 'on'
            };

            localStorage.setItem('adminSecuritySettings', JSON.stringify(securitySettings));
            
            if (newPassword) {
                // In a real app, you'd hash and store the password securely
                this.showToast('Password updated successfully!', 'success');
            } else {
                this.showToast('Security settings updated successfully!', 'success');
            }
            
            // Clear password fields
            e.target.reset();
        } catch (error) {
            console.error('Error updating security settings:', error);
            this.showToast('Error updating security settings', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showSettingsTab(tabId) {
        // Hide all content
        document.querySelectorAll('.settings-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active from all tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected content
        const targetContent = document.getElementById(`${tabId}-settings`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Add active to selected tab
        const targetTab = document.querySelector(`[onclick="showSettingsTab('${tabId}')"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    }

    changeTheme(theme) {
        // Update theme selection UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`[data-theme="${theme}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        // Apply theme immediately
        this.applyTheme(theme);
        
        // Save preference
        const settings = JSON.parse(localStorage.getItem('portfolioSettings') || '{}');
        settings.theme = theme;
        localStorage.setItem('portfolioSettings', JSON.stringify(settings));
        
        this.showToast(`Theme changed to ${theme}`, 'success');
    }

    saveAppearanceSettings() {
        const fontSize = document.getElementById('font-size')?.value || 'medium';
        const fontFamily = document.getElementById('font-family')?.value || 'system';
        const selectedTheme = document.querySelector('.theme-option.active')?.dataset.theme || 'default';

        const appearanceSettings = {
            theme: selectedTheme,
            fontSize: fontSize,
            fontFamily: fontFamily
        };

        localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
        this.applyAppearanceSettings(appearanceSettings);
        this.showToast('Appearance settings saved!', 'success');
    }

    applyAppearanceSettings(settings) {
        const root = document.documentElement;
        
        // Apply font size
        const fontSizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        root.style.setProperty('--base-font-size', fontSizes[settings.fontSize] || '16px');
        
        // Apply font family
        const fontFamilies = {
            system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            roboto: '"Roboto", sans-serif',
            opensans: '"Open Sans", sans-serif',
            lato: '"Lato", sans-serif'
        };
        root.style.setProperty('--base-font-family', fontFamilies[settings.fontFamily] || fontFamilies.system);
        
        // Apply theme
        this.applyTheme(settings.theme);
    }

    // Data export/import functions
    exportAllData() {
        try {
            const data = {
                portfolioData: this.portfolioData,
                settings: JSON.parse(localStorage.getItem('portfolioSettings') || '{}'),
                securitySettings: JSON.parse(localStorage.getItem('adminSecuritySettings') || '{}'),
                appearanceSettings: JSON.parse(localStorage.getItem('appearanceSettings') || '{}'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }

    triggerFileUpload() {
        document.getElementById('backup-file')?.click();
    }

    importBackupData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.portfolioData || !data.version) {
                    throw new Error('Invalid backup file format');
                }

                // Confirm import
                if (!confirm('This will replace all current data. Are you sure?')) {
                    return;
                }

                this.showLoading(true);

                // Import data
                this.portfolioData = data.portfolioData;
                this.cacheData();
                this.notifyPortfolioUpdate();

                // Import settings
                if (data.settings) {
                    localStorage.setItem('portfolioSettings', JSON.stringify(data.settings));
                }
                if (data.securitySettings) {
                    localStorage.setItem('adminSecuritySettings', JSON.stringify(data.securitySettings));
                }
                if (data.appearanceSettings) {
                    localStorage.setItem('appearanceSettings', JSON.stringify(data.appearanceSettings));
                    this.applyAppearanceSettings(data.appearanceSettings);
                }

                // Refresh UI
                this.updateStats();
                this.populateDataGrids();
                this.loadFormData();

                this.showToast('Data imported successfully!', 'success');
                this.showNotification('Data Imported', 'Portfolio data has been restored from backup.');
            } catch (error) {
                console.error('Error importing data:', error);
                this.showToast('Error importing data. Please check file format.', 'error');
            } finally {
                this.showLoading(false);
                input.value = ''; // Clear file input
            }
        };

        reader.readAsText(file);
    }

    resetToDefaults() {
        if (!confirm('This will reset all data to defaults. Are you sure?')) return;

        try {
            this.showLoading(true);

            // Clear all stored data
            localStorage.removeItem('portfolioData');
            localStorage.removeItem('portfolioSettings');
            localStorage.removeItem('adminSecuritySettings');
            localStorage.removeItem('appearanceSettings');
            localStorage.removeItem('adminDrafts');

            // Reinitialize with defaults
            window.mockAPI.initializeDefaultData();
            this.loadPortfolioData();

            this.showToast('Data reset to defaults successfully!', 'success');
            
            // Reload page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showToast('Error resetting data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    clearAllData() {
        if (!confirm('This will permanently delete ALL data. Are you absolutely sure?')) return;
        if (!confirm('This action cannot be undone. Confirm deletion?')) return;

        try {
            this.showLoading(true);

            // Clear all localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('portfolio') || key.startsWith('admin') || key.startsWith('appearance')) {
                    localStorage.removeItem(key);
                }
            });

            this.portfolioData = {
                projects: [],
                achievements: [],
                contacts: [],
                skills: [],
                profile: null,
                education: []
            };

            this.cacheData();
            this.notifyPortfolioUpdate();
            this.updateStats();
            this.populateDataGrids();

            this.showToast('All data cleared successfully!', 'warning');
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showToast('Error clearing data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Filtering functions for data grids
    filterProjects() {
        const filter = document.getElementById('project-filter')?.value || 'all';
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            const status = card.dataset.status;
            if (filter === 'all' || status === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterAchievements() {
        const filter = document.getElementById('achievement-filter')?.value || 'all';
        const cards = document.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            const type = card.dataset.type;
            if (filter === 'all' || type === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterSkills() {
        const filter = document.getElementById('skill-filter')?.value || 'all';
        const cards = document.querySelectorAll('.skill-card');
        
        cards.forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterMessages() {
        const filter = document.getElementById('message-filter')?.value || 'all';
        const cards = document.querySelectorAll('.message-card');
        
        cards.forEach(card => {
            const isUnread = card.classList.contains('unread');
            
            if (filter === 'all' || 
                (filter === 'unread' && isUnread) || 
                (filter === 'read' && !isUnread)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    deleteAllRead() {
        if (!confirm('Delete all read messages?')) return;

        try {
            this.showLoading(true);
            
            // Filter out read messages
            this.portfolioData.contacts = this.portfolioData.contacts.filter(contact => !contact.isRead);
            this.cacheData();
            this.notifyPortfolioUpdate();
            
            // Update UI
            this.populateMessagesGrid();
            this.updateStats();
            
            this.showToast('Read messages deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting read messages:', error);
            this.showToast('Error deleting messages', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Edit functions (placeholders for future implementation)
    editProject(id) {
        const project = this.portfolioData.projects.find(p => p.id === id);
        if (project) {
            // Populate form with project data
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-technologies').value = project.technologies;
            document.getElementById('project-demo').value = project.demoUrl || '';
            document.getElementById('project-github').value = project.githubUrl || '';
            document.getElementById('project-image').value = project.imageUrl || '';
            document.getElementById('project-category').value = project.category;
            document.getElementById('project-status').value = project.status;
            
            // Show projects section
            this.showSection('projects');
            
            // Scroll to form
            document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
            
            this.showToast(`Editing project: ${project.title}`, 'info');
        }
    }

    editAchievement(id) {
        const achievement = this.portfolioData.achievements.find(a => a.id === id);
        if (achievement) {
            // Populate form with achievement data
            document.getElementById('achievement-title').value = achievement.title;
            document.getElementById('achievement-organization').value = achievement.organization;
            document.getElementById('achievement-date').value = achievement.date;
            document.getElementById('achievement-type').value = achievement.type;
            document.getElementById('achievement-level').value = achievement.level;
            document.getElementById('achievement-description').value = achievement.description;
            document.getElementById('achievement-certificate').value = achievement.certificateUrl || '';
            
            // Show achievements section
            this.showSection('achievements');
            
            // Scroll to form
            document.getElementById('achievement-form').scrollIntoView({ behavior: 'smooth' });
            
            this.showToast(`Editing achievement: ${achievement.title}`, 'info');
        }
    }

    editSkill(id) {
        const skill = this.portfolioData.skills.find(s => s.id === id);
        if (skill) {
            // Populate form with skill data
            document.getElementById('skill-name').value = skill.name;
            document.getElementById('skill-category').value = skill.category;
            document.getElementById('skill-level').value = skill.level;
            document.getElementById('skill-icon').value = skill.iconClass || '';
            
            // Show skills section
            this.showSection('skills');
            
            // Scroll to form
            document.getElementById('skill-form').scrollIntoView({ behavior: 'smooth' });
            
            this.showToast(`Editing skill: ${skill.name}`, 'info');
        }
    }

    editEducation(id) {
        const education = this.portfolioData.education.find(e => e.id === id);
        if (education) {
            // Populate form with education data
            document.getElementById('education-degree').value = education.degree;
            document.getElementById('education-school').value = education.school;
            document.getElementById('education-year').value = education.duration;
            document.getElementById('education-gpa').value = education.gpa || '';
            document.getElementById('education-location').value = education.location || '';
            document.getElementById('education-description').value = education.description || '';
            
            // Show education section
            this.showSection('education');
            
            // Scroll to form
            document.getElementById('education-form').scrollIntoView({ behavior: 'smooth' });
            
            this.showToast(`Editing education: ${education.degree}`, 'info');
        }
    }

    // Image upload handling
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('profile-preview');
            if (preview) {
                preview.src = e.target.result;
                
                // Update profile data
                if (this.portfolioData.profile) {
                    this.portfolioData.profile.profileImageUrl = e.target.result;
                    this.markUnsavedChanges();
                }
                
                this.showToast('Profile image updated', 'success');
            }
        };

        reader.readAsDataURL(file);
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveDraft();
            this.showToast('Draft saved', 'info');
        }

        // Ctrl+E to export data
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.exportAllData();
        }

        // Ctrl+1-9 for quick section navigation
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const sections = ['dashboard', 'profile', 'about', 'skills', 'projects', 'education', 'achievements', 'contacts', 'settings'];
            const sectionIndex = parseInt(e.key) - 1;
            if (sections[sectionIndex]) {
                this.showSection(sections[sectionIndex]);
            }
        }
    }

    // Activity logging
    logActivity(type, description) {
        const activity = {
            timestamp: new Date().toISOString(),
            type: type,
            description: description,
            user: this.currentUser?.email || 'admin'
        };

        const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
        logs.unshift(activity);
        localStorage.setItem('adminActivityLogs', JSON.stringify(logs.slice(0, 100))); // Keep last 100 activities
    }

    // Preview functionality
    previewProfile() {
        const portfolioWindow = window.open('index.html', '_blank');
        portfolioWindow.addEventListener('load', () => {
            if (portfolioWindow.portfolioManager) {
                portfolioWindow.portfolioManager.handleDataUpdate(this.portfolioData);
            }
        });
        this.showToast('Opening portfolio preview...', 'info');
    }

    previewAbout() {
        const portfolioWindow = window.open('index.html#about', '_blank');
        this.showToast('Opening about section preview...', 'info');
    }

    // Load saved settings on initialization
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('portfolioSettings') || '{}');
            const securitySettings = JSON.parse(localStorage.getItem('adminSecuritySettings') || '{}');
            const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings') || '{}');

            // Apply settings
            if (settings.portfolioTheme) {
                this.applyTheme(settings.portfolioTheme);
            }

            if (appearanceSettings.theme || appearanceSettings.fontSize || appearanceSettings.fontFamily) {
                this.applyAppearanceSettings(appearanceSettings);
            }

            // Populate settings forms
            this.populateSettingsForms(settings, securitySettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    populateSettingsForms(settings, securitySettings) {
        // Populate general settings
        if (settings.siteTitle) {
            const siteTitle = document.getElementById('site-title');
            if (siteTitle) siteTitle.value = settings.siteTitle;
        }

        if (settings.siteDescription) {
            const siteDescription = document.getElementById('site-description');
            if