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
        this.editingProjectId = null;
        this.editingEducationId = null;
        this.editingAchievementId = null;
        this.editingSkillId = null;
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
        // Show the section from hash if present
        this.handleHashNavigation();
    }

    // Safe settings loader
    loadSettings() {
        return; // reserved for future preferences
    }

    checkAuthentication() {
        const session = localStorage.getItem('adminSession');
        if (!session) {
            this.redirectToPortfolio();
            return;
        }
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
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
        setTimeout(() => { window.location.href = 'index.html?admin=true'; }, 1000);
    }

    setupEventListeners() {
        // Forms - Add all form event listeners
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('about-form')?.addEventListener('submit', (e) => this.handleAboutSubmit(e));
        document.getElementById('skill-form')?.addEventListener('submit', (e) => this.handleSkillSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('education-form')?.addEventListener('submit', (e) => this.handleEducationSubmit(e));
        document.getElementById('achievement-form')?.addEventListener('submit', (e) => this.handleAchievementSubmit(e));
        document.getElementById('general-settings-form')?.addEventListener('submit', (e) => this.handleGeneralSettingsSubmit(e));
        document.getElementById('security-settings-form')?.addEventListener('submit', (e) => this.handleSecuritySettingsSubmit(e));

        // Image upload
        document.getElementById('profile-image')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.querySelector('.image-preview')?.addEventListener('click', () => document.getElementById('profile-image')?.click());
        document.getElementById('profile-image-url')?.addEventListener('change', (e) => {
            const url = e.target.value?.trim();
            if (url) { 
                const pv = document.getElementById('profile-preview'); 
                if (pv) pv.src = url; 
                this.markUnsavedChanges(); 
            }
        });

        // Theme options (no-op if absent)
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const t = e.currentTarget?.dataset?.theme;
                if (t) this.showToast(`Theme switched to ${t}`, 'info');
            });
        });

        // Track unsaved changes on all form inputs
        document.querySelectorAll('form input, form textarea, form select').forEach(input => {
            input.addEventListener('change', () => this.markUnsavedChanges());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Hash navigation
        window.addEventListener('hashchange', () => this.handleHashNavigation());

        // Simple section switch links
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sec = link.getAttribute('data-section');
                if (sec) this.showSection(sec);
                document.querySelectorAll('[data-section]').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Session keep-alive
        this.setupSessionManagement();
    }

    setupSessionManagement() {
        let activityTimer;
        ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                clearTimeout(activityTimer);
                activityTimer = setTimeout(() => this.extendSession(), 5 * 60 * 1000);
            });
        });
        setInterval(() => this.checkSessionValidity(), 60 * 1000);
    }

    extendSession() {
        const session = localStorage.getItem('adminSession');
        if (!session) return;
        try {
            const sessionData = JSON.parse(session);
            sessionData.expires = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
        } catch (e) { console.error('extendSession', e); }
    }

    checkSessionValidity() {
        const session = localStorage.getItem('adminSession');
        if (!session) return;
        try {
            const sessionData = JSON.parse(session);
            const timeLeft = sessionData.expires - Date.now();
            if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
                this.showToast('Session will expire in 5 minutes', 'warning');
            }
            if (timeLeft <= 0) this.handleSessionExpired();
        } catch (e) { console.error('checkSessionValidity', e); }
    }

    handleSessionExpired() {
        this.showToast('Session expired. Redirecting to login...', 'error');
        localStorage.removeItem('adminSession');
        setTimeout(() => { window.location.href = 'index.html?admin=true'; }, 1000);
    }

    setupAutoSave() {
        setInterval(() => { if (this.hasUnsavedChanges) this.saveDraft(); }, 30 * 1000);
    }

    setupRealtimeUpdates() {
        window.addEventListener('beforeunload', () => this.notifyPortfolioUpdate());
        window.addEventListener('message', (e) => {
            if (e.data?.type === 'portfolioRequest') this.handlePortfolioRequest(e.data);
        });
    }

    notifyPortfolioUpdate() {
        try {
            localStorage.setItem('portfolioData', JSON.stringify(this.portfolioData));
            const portfolioWindow = window.opener || window.parent;
            if (portfolioWindow && portfolioWindow !== window) {
                portfolioWindow.postMessage({ type: 'adminDataUpdate', data: this.portfolioData }, '*');
            }
            window.dispatchEvent(new CustomEvent('adminDataUpdate', { detail: this.portfolioData }));
        } catch (error) {
            console.error('notifyPortfolioUpdate', error);
        }
    }

    initializeNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotification(title, message, type = 'info') {
        if ('Notification' in window && Notification.permission === 'granted') {
            const n = new Notification(title, { body: message });
            setTimeout(() => n.close(), 4000);
        }
        this.showToast(message, type);
    }

    loadCachedData() {
        try { const cached = localStorage.getItem('portfolioData'); return cached ? JSON.parse(cached) : null; }
        catch { return null; }
    }

    loadDraftData() {
        try {
            const drafts = JSON.parse(localStorage.getItem('adminDrafts') || '{}');
            Object.keys(drafts).forEach(key => {
                if (drafts[key] && this.portfolioData[key]) {
                    this.portfolioData[key] = { ...this.portfolioData[key], ...drafts[key] };
                }
            });
        } catch {}
    }

    saveDraft() {
        try {
            const drafts = JSON.parse(localStorage.getItem('adminDrafts') || '{}');
            Object.keys(this.portfolioData).forEach(key => {
                if (JSON.stringify(this.portfolioData[key]) !== JSON.stringify(this.originalData[key])) {
                    drafts[key] = this.portfolioData[key];
                }
            });
            localStorage.setItem('adminDrafts', JSON.stringify(drafts));
            this.showToast('Draft saved automatically', 'info');
            this.hasUnsavedChanges = false;
        } catch (error) { console.error('saveDraft', error); }
    }

    clearDrafts() { localStorage.removeItem('adminDrafts'); this.hasUnsavedChanges = false; }
    cacheData() { try { localStorage.setItem('portfolioData', JSON.stringify(this.portfolioData)); } catch {} }

    markUnsavedChanges() { this.hasUnsavedChanges = true; this.updateUnsavedIndicator(); }
    markSavedChanges() { this.hasUnsavedChanges = false; this.updateUnsavedIndicator(); this.clearDrafts(); }

    updateUnsavedIndicator() {
        let indicator = document.querySelector('.unsaved-indicator');
        if (this.hasUnsavedChanges && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'unsaved-indicator';
            indicator.innerHTML = '<i class="fas fa-circle"></i> Unsaved changes';
            document.querySelector('.admin-nav')?.appendChild(indicator);
        } else if (!this.hasUnsavedChanges && indicator) indicator.remove();
    }

    // Message center helpers
    updateMessageStats() {
        const total = this.portfolioData.contacts.length;
        const unread = this.portfolioData.contacts.filter(m => !m.isRead).length;
        const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setText('total-messages', total);
        setText('unread-messages', unread);
        setText('unread-count', unread);
        setText('messages-count', unread);
    }

    markAsRead(id) {
        const msg = this.portfolioData.contacts.find(m => m.id === id);
        if (!msg) return;
        msg.isRead = true;
        this.cacheData();
        this.notifyPortfolioUpdate();
        const card = document.querySelector(`.message-card[data-id="${id}"]`);
        if (card) {
            card.classList.remove('unread');
            card.querySelector('.unread-indicator')?.remove();
        }
        this.updateMessageStats();
        this.showToast('Message marked as read', 'success');
    }

    deleteMessage(id) {
        const before = this.portfolioData.contacts.length;
        this.portfolioData.contacts = this.portfolioData.contacts.filter(m => m.id !== id);
        if (this.portfolioData.contacts.length === before) return;
        this.cacheData();
        this.notifyPortfolioUpdate();
        document.querySelector(`.message-card[data-id="${id}"]`)?.remove();
        this.updateMessageStats();
        this.showToast('Message deleted', 'success');
    }

    markAllAsRead() {
        let changed = false;
        this.portfolioData.contacts.forEach(m => { if (!m.isRead) { m.isRead = true; changed = true; } });
        if (!changed) { this.showToast('No unread messages', 'info'); return; }
        this.cacheData();
        this.notifyPortfolioUpdate();
        document.querySelectorAll('.message-card.unread').forEach(c => c.classList.remove('unread'));
        document.querySelectorAll('.message-card .unread-indicator').forEach(i => i.remove());
        this.updateMessageStats();
        this.showToast('All messages marked as read', 'success');
    }

    deleteAllRead() {
        const before = this.portfolioData.contacts.length;
        this.portfolioData.contacts = this.portfolioData.contacts.filter(m => !m.isRead);
        if (this.portfolioData.contacts.length === before) { this.showToast('No read messages to delete', 'info'); return; }
        this.cacheData(); this.notifyPortfolioUpdate(); this.populateMessagesGrid(); this.updateMessageStats();
        this.showToast('Deleted all read messages', 'success');
    }

    loadFormData() {
        if (this.portfolioData.profile) {
            this.populateProfileForm();
            this.populateAboutForm();
        }
    }

    populateProfileForm() {
        const p = this.portfolioData.profile; if (!p) return;
        const map = { 'full-name': p.fullName, 'title': p.title, 'description': p.description, 'linkedin': p.linkedInUrl, 'github': p.gitHubUrl, 'facebook': p.facebookUrl, 'whatsapp': p.whatsAppNumber, 'email': p.email, 'profile-image-url': p.profileImageUrl };
        Object.entries(map).forEach(([id, v]) => { const el = document.getElementById(id); if (el && v) el.value = v; });
        if (p.profileImageUrl) { const pv = document.getElementById('profile-preview'); if (pv) pv.src = p.profileImageUrl; }
    }

    populateAboutForm() {
        const ac = document.getElementById('about-content');
        if (ac && this.portfolioData.profile?.aboutContent) ac.value = this.portfolioData.profile.aboutContent;
    }

    updateStats() {
        const stats = {
            'projects-count': this.portfolioData.projects.length,
            'achievements-count': this.portfolioData.achievements.length,
            'skills-count': this.portfolioData.skills.length,
            'messages-count': this.portfolioData.contacts.filter(c => !c.isRead).length,
            'unread-count': this.portfolioData.contacts.filter(c => !c.isRead).length,
            'total-messages': this.portfolioData.contacts.length
        };
        Object.entries(stats).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) this.animateCounter(el, parseInt(el.textContent) || 0, val);
        });
    }

    animateCounter(element, start, end) {
        const duration = 600; const inc = (end - start) / (duration / 16); let cur = start;
        const timer = setInterval(() => { cur += inc; if ((inc > 0 && cur >= end) || (inc < 0 && cur <= end)) { cur = end; clearInterval(timer); } element.textContent = Math.floor(cur); }, 16);
    }

    loadRecentActivity() {
        const list = document.getElementById('activity-list'); if (!list) return;
        const items = [];
        this.portfolioData.projects.slice(0, 2).forEach(p => items.push({ icon: 'fas fa-plus', color: '#10b981', text: `Added project: ${p.title}`, time: this.getRelativeTime(p.createdDate || new Date()) }));
        this.portfolioData.achievements.slice(0, 2).forEach(a => items.push({ icon: 'fas fa-trophy', color: '#f59e0b', text: `Added achievement: ${a.title}`, time: this.getRelativeTime(a.date) }));
        this.portfolioData.education.slice(0, 1).forEach(e => items.push({ icon: 'fas fa-graduation-cap', color: '#8b5cf6', text: `Added education: ${e.degree}`, time: this.getRelativeTime(e.createdDate || new Date()) }));
        this.portfolioData.contacts.slice(0, 1).forEach(c => items.push({ icon: 'fas fa-envelope', color: '#06b6d4', text: `New message from ${c.name}`, time: this.getRelativeTime(c.createdDate || new Date()) }));
        list.innerHTML = items.slice(0, 5).map(i => `
            <div class="activity-item">
                <div class="activity-icon" style="background:${i.color}"><i class="${i.icon}"></i></div>
                <div class="activity-content"><p>${i.text}</p><span class="activity-time">${i.time}</span></div>
            </div>`).join('');
    }

    getRelativeTime(dateString) {
        const d = new Date(dateString); const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return d.toLocaleDateString();
    }

    populateDataGrids() {
        this.populateProjectsGrid();
        this.populateAchievementsGrid();
        this.populateSkillsGrid();
        this.populateMessagesGrid();
        this.populateEducationTimeline();
    }

    populateProjectsGrid() {
        const grid = document.getElementById('projects-grid'); if (!grid) return;
        grid.innerHTML = this.portfolioData.projects.map(project => `
            <div class="project-card" data-id="${project.id}" data-status="${project.status}" data-category="${project.category}">
                <div class="project-header">
                    <h4><i class="fas fa-project-diagram"></i> ${project.title}</h4>
                    <span class="status-badge status-${(project.status || 'completed').toLowerCase().replace(' ', '-')}">${project.status || 'Completed'}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="tech-tags">${(project.technologies || '').split(',').filter(Boolean).map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>
                    <div class="project-category"><i class="fas fa-folder"></i> ${project.category || 'Web Development'}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editProject(${project.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteProjectHandler(${project.id})"><i class="fas fa-trash"></i> Delete</button>
                    ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-sm btn-info"><i class="fab fa-github"></i> Code</a>` : ''}
                </div>
            </div>`).join('');
    }

    populateAchievementsGrid() {
        const grid = document.getElementById('achievements-grid'); if (!grid) return;
        grid.innerHTML = this.portfolioData.achievements.map(a => {
            const typeSafe = (a.type || 'Certification').toString(); const typeClass = typeSafe.toLowerCase().replace(/\s+/g, '-');
            const levelSafe = (a.level || 'Professional').toString(); const d = a.date ? new Date(a.date) : null; const ds = (d && !isNaN(d)) ? d.toLocaleDateString() : 'N/A';
            return `
            <div class="achievement-card" data-id="${a.id}" data-type="${typeSafe}">
                <div class="achievement-header">
                    <h4><i class="fas fa-trophy"></i> ${a.title || 'Untitled'}</h4>
                    <span class="type-badge type-${typeClass}">${typeSafe}</span>
                </div>
                <p class="achievement-org"><strong><i class="fas fa-building"></i> ${a.organization || ''}</strong></p>
                <p class="achievement-description">${a.description || ''}</p>
                <div class="achievement-meta">
                    <span class="date-tag"><i class="fas fa-calendar"></i> ${ds}</span>
                    <span class="level-tag"><i class="fas fa-medal"></i> ${levelSafe}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editAchievement(${a.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteAchievementHandler(${a.id})"><i class="fas fa-trash"></i> Delete</button>
                    ${a.certificateUrl ? `<a href="${a.certificateUrl}" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-certificate"></i> View</a>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    editAchievement(id) {
        const ach = this.portfolioData.achievements.find(a => a.id === id);
        if (!ach) { this.showToast('Achievement not found', 'error'); return; }
        const form = document.getElementById('achievement-form'); if (!form) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        setVal('achievement-title', ach.title || '');
        setVal('achievement-organization', ach.organization || '');
        setVal('achievement-date', ach.date ? new Date(ach.date).toISOString().slice(0,10) : '');
        setVal('achievement-type', ach.type || 'Certification');
        setVal('achievement-level', ach.level || 'Professional');
        setVal('achievement-certificate', ach.certificateUrl || '');
        setVal('achievement-description', ach.description || '');
        this.editingAchievementId = id;
        form.dataset.editingId = String(id);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Achievement';
        this.showSection('achievements');
        this.showToast('Editing achievement. Make changes and click Update.', 'info');
    }

    async deleteAchievementHandler(id) {
        if (!confirm('Delete this achievement?')) return;
        const before = this.portfolioData.achievements.length;
        this.portfolioData.achievements = this.portfolioData.achievements.filter(a => a.id !== id);
        if (this.portfolioData.achievements.length === before) return;
        this.cacheData(); this.notifyPortfolioUpdate(); this.populateAchievementsGrid(); this.updateStats();
        const form = document.getElementById('achievement-form');
        if (this.editingAchievementId === id && form) {
            form.reset(); delete form.dataset.editingId; this.editingAchievementId = null;
            const submitBtn = form.querySelector('button[type="submit"]'); if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Achievement';
        }
        try { if (window.mockAPI?.deleteAchievement) await window.mockAPI.deleteAchievement(id); } catch {}
        this.showToast('Achievement deleted', 'success');
    }

    async handleAchievementSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const isEditing = !!this.editingAchievementId || !!form.dataset.editingId;
        const idToUse = isEditing ? Number(form.dataset.editingId || this.editingAchievementId) : Date.now();
        
        // Get form values with correct field names
        const data = {
            id: idToUse,
            title: fd.get('title')?.toString().trim() || '',
            description: fd.get('description')?.toString().trim() || '',
            organization: fd.get('organization')?.toString().trim() || '',
            date: fd.get('date') || '',
            certificateUrl: fd.get('certificateUrl')?.toString().trim() || '',
            type: fd.get('type') || 'Certification',
            level: fd.get('level') || 'Professional',
            // Additional fields for enhanced achievements page
            expiryDate: fd.get('expiryDate') || '',
            score: fd.get('score')?.toString().trim() || '',
            credentialId: fd.get('credentialId')?.toString().trim() || '',
            verificationUrl: fd.get('verificationUrl')?.toString().trim() || '',
            skills: fd.get('skills')?.toString().trim() || '',
            featured: fd.get('featured') === 'on',
            showInPortfolio: fd.get('showInPortfolio') === 'on',
            verified: fd.get('verified') === 'on',
            lifetime: fd.get('lifetime') === 'on',
            createdDate: isEditing ? (this.portfolioData.achievements.find(a => a.id === idToUse)?.createdDate || new Date().toISOString()) : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        
        // Validate required fields
        if (!data.title || !data.organization || !data.date) { 
            this.showToast('Please fill in Title, Organization, and Date fields', 'error'); 
            return; 
        }
        
        try {
            this.showLoading(true);
            
            // Update or add achievement
            if (isEditing) {
                const idx = this.portfolioData.achievements.findIndex(a => a.id === idToUse);
                if (idx !== -1) {
                    this.portfolioData.achievements[idx] = { ...this.portfolioData.achievements[idx], ...data };
                }
            } else {
                this.portfolioData.achievements.unshift(data);
            }
            
            // Save and sync
            this.cacheData(); 
            this.notifyPortfolioUpdate(); 
            this.populateAchievementsGrid(); 
            this.updateStats();
            
            // Persist via mock API
            try {
                if (isEditing && window.mockAPI?.updateAchievement) {
                    await window.mockAPI.updateAchievement(data);
                } else if (window.mockAPI?.addAchievement) {
                    await window.mockAPI.addAchievement(data);
                }
            } catch (apiError) {
                console.warn('API call failed:', apiError);
            }
            
            // Reset form
            form.reset();
            if (isEditing) {
                delete form.dataset.editingId; 
                this.editingAchievementId = null;
                const submitBtn = form.querySelector('button[type="submit"]'); 
                if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Achievement';
            }
            
            this.showToast(isEditing ? 'Achievement updated successfully!' : 'Achievement added successfully!', 'success');
            this.markSavedChanges();
            
        } catch (err) {
            console.error('Error saving achievement:', err);
            this.showToast('Error saving achievement. Please try again.', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    async deleteProjectHandler(id) {
        if (!confirm('Delete this project?')) return;
        const before = this.portfolioData.projects.length;
        this.portfolioData.projects = this.portfolioData.projects.filter(p => p.id !== id);
        if (this.portfolioData.projects.length === before) return;
        this.cacheData(); this.notifyPortfolioUpdate(); this.populateProjectsGrid(); this.updateStats();
        try { if (window.mockAPI?.deleteProject) await window.mockAPI.deleteProject(id); } catch {}
        // Re-sync from API/cache to avoid drift
        await this.loadFromAPI();
        this.populateProjectsGrid(); this.updateStats();
        this.showToast('Project deleted', 'success');
        const form = document.getElementById('project-form');
        if (this.editingProjectId === id && form) {
            form.reset(); delete form.dataset.editingId; this.editingProjectId = null;
            const submitBtn = form.querySelector('button[type="submit"]'); if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Project</span>';
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const isEditing = !!this.editingProjectId || !!form.dataset.editingId;
        const idToUse = isEditing ? Number(form.dataset.editingId || this.editingProjectId) : Date.now();
        const data = {
            id: idToUse,
            title: fd.get('title')?.toString().trim(),
            description: fd.get('description')?.toString().trim(),
            technologies: fd.get('technologies')?.toString().trim(),
            imageUrl: fd.get('imageUrl')?.toString().trim(),
            demoUrl: fd.get('demoUrl')?.toString().trim(),
            githubUrl: fd.get('githubUrl')?.toString().trim(),
            category: fd.get('category')?.toString().trim() || 'Web Development',
            status: fd.get('status')?.toString().trim() || 'Completed',
            createdDate: isEditing ? (this.portfolioData.projects.find(p => p.id === idToUse)?.createdDate || new Date().toISOString()) : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        if (!data.title || !data.description) { this.showToast('Title and Description are required', 'error'); return; }
        try {
            this.showLoading(true);
            if (isEditing) {
                const idx = this.portfolioData.projects.findIndex(p => p.id === idToUse);
                if (idx !== -1) this.portfolioData.projects[idx] = { ...this.portfolioData.projects[idx], ...data };
            } else {
                this.portfolioData.projects.unshift(data);
            }
            this.cacheData(); this.notifyPortfolioUpdate(); this.populateProjectsGrid(); this.updateStats();
            // Persist via mock API when available, then re-sync
            try {
                if (isEditing) {
                    await fetch(`${this.baseUrl}/projects/${idToUse}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                } else {
                    await fetch(`${this.baseUrl}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                }
            } catch {}
            await this.loadFromAPI();
            this.populateProjectsGrid(); this.updateStats(); this.notifyPortfolioUpdate();
            form.reset();
            if (isEditing) {
                delete form.dataset.editingId; this.editingProjectId = null;
                const submitBtn = form.querySelector('button[type="submit"]'); if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Project</span>';
            }
            this.showToast(isEditing ? 'Project updated' : 'Project added', 'success');
            this.markSavedChanges();
        } catch (err) {
            console.error('Project save error', err);
            this.showToast('Failed to save project', 'error');
        } finally { this.showLoading(false); }
    }

    // Education handlers
    editEducation(id) {
        const item = this.portfolioData.education.find(x => x.id === id);
        if (!item) { this.showToast('Education not found', 'error'); return; }
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
        set('edu-degree', item.degree);
        set('edu-school', item.school);
        set('edu-duration', item.duration);
        set('edu-location', item.location);
        set('edu-gpa', item.gpa);
        set('edu-start', item.startDate ? new Date(item.startDate).toISOString().slice(0,10) : '');
        set('edu-end', item.endDate ? new Date(item.endDate).toISOString().slice(0,10) : '');
        set('edu-desc', item.description);
        const form = document.getElementById('education-form');
        if (form) {
            this.editingEducationId = id;
            form.dataset.editingId = String(id);
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Education';
        }
        this.showSection('education');
        this.showToast(`Editing education: ${item.degree}`, 'info');
    }

    async deleteEducationHandler(id) {
        if (!confirm('Delete this education item?')) return;
        const before = this.portfolioData.education.length;
        this.portfolioData.education = this.portfolioData.education.filter(e => e.id !== id);
        if (this.portfolioData.education.length === before) return;
        this.cacheData(); this.notifyPortfolioUpdate(); this.populateEducationTimeline();
        try { if (window.mockAPI?.deleteEducation) await window.mockAPI.deleteEducation(id); } catch {}
        const form = document.getElementById('education-form');
        if (this.editingEducationId === id && form) {
            form.reset(); delete form.dataset.editingId; this.editingEducationId = null;
            const submitBtn = form.querySelector('button[type="submit"]'); if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Education</span>';
        }
        this.showToast('Education removed', 'success');
    }

    async handleEducationSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const isEditing = !!this.editingEducationId || !!form.dataset.editingId;
        const idToUse = isEditing ? Number(form.dataset.editingId || this.editingEducationId) : Date.now();
        
        // Get form values with correct field names
        const data = {
            id: idToUse,
            degree: fd.get('degree')?.toString().trim() || '',
            school: fd.get('school')?.toString().trim() || '',
            duration: fd.get('duration')?.toString().trim() || '',
            location: fd.get('location')?.toString().trim() || '',
            gpa: fd.get('gpa')?.toString().trim() || '',
            description: fd.get('description')?.toString().trim() || '',
            startDate: fd.get('startDate')?.toString() || '',
            endDate: fd.get('endDate')?.toString() || '',
            // Additional fields for enhanced education page
            fieldOfStudy: fd.get('fieldOfStudy')?.toString().trim() || '',
            level: fd.get('level') || 'Bachelor',
            honors: fd.get('honors')?.toString().trim() || '',
            coursework: fd.get('coursework')?.toString().trim() || '',
            current: fd.get('current') === 'on',
            showInPortfolio: fd.get('showInPortfolio') === 'on',
            featured: fd.get('featured') === 'on',
            showGPA: fd.get('showGPA') === 'on',
            createdDate: isEditing ? (this.portfolioData.education.find(x => x.id === idToUse)?.createdDate || new Date().toISOString()) : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        
        // Validate required fields
        if (!data.degree || !data.school) { 
            this.showToast('Please fill in Degree and School fields', 'error'); 
            return; 
        }
        
        try {
            this.showLoading(true);
            
            // Update or add education
            if (isEditing) {
                const idx = this.portfolioData.education.findIndex(x => x.id === idToUse);
                if (idx !== -1) {
                    this.portfolioData.education[idx] = { ...this.portfolioData.education[idx], ...data };
                }
            } else {
                this.portfolioData.education.unshift(data);
            }
            
            // Save and sync
            this.cacheData(); 
            this.notifyPortfolioUpdate(); 
            this.populateEducationTimeline();
            
            // Persist via mock API
            try {
                if (isEditing && window.mockAPI?.updateEducation) {
                    await window.mockAPI.updateEducation(data);
                } else if (window.mockAPI?.addEducation) {
                    await window.mockAPI.addEducation(data);
                }
            } catch (apiError) {
                console.warn('API call failed:', apiError);
            }
            
            // Reset form
            form.reset();
            if (isEditing) {
                delete form.dataset.editingId; 
                this.editingEducationId = null;
                const submitBtn = form.querySelector('button[type="submit"]'); 
                if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Add Education</span>';
            }
            
            this.showToast(isEditing ? 'Education updated successfully!' : 'Education added successfully!', 'success');
            this.markSavedChanges();
            
        } catch (err) {
            console.error('Education save error', err);
            this.showToast('Failed to save education. Please check all fields and try again.', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    async handleSkillSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const isEditing = !!this.editingSkillId || !!form.dataset.editingId;
        const idToUse = isEditing ? Number(form.dataset.editingId || this.editingSkillId) : Date.now();
        
        // Get form values
        const data = {
            id: idToUse,
            name: fd.get('name')?.toString().trim() || '',
            category: fd.get('category') || 'Other',
            level: fd.get('level') || 'Intermediate',
            proficiencyPercentage: Number(fd.get('proficiencyPercentage')) || 75,
            yearsOfExperience: Number(fd.get('yearsOfExperience')) || 0,
            iconClass: fd.get('iconClass')?.toString().trim() || 'fas fa-code',
            createdDate: isEditing ? (this.portfolioData.skills.find(s => s.id === idToUse)?.createdDate || new Date().toISOString()) : new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };
        
        // Validate required fields
        if (!data.name) { 
            this.showToast('Please enter a skill name', 'error'); 
            return; 
        }
        
        // Check for duplicates (only if not editing)
        if (!isEditing && this.portfolioData.skills.some(s => s.name.toLowerCase() === data.name.toLowerCase())) {
            this.showToast('Skill already exists', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Update or add skill
            if (isEditing) {
                const idx = this.portfolioData.skills.findIndex(s => s.id === idToUse);
                if (idx !== -1) {
                    this.portfolioData.skills[idx] = { ...this.portfolioData.skills[idx], ...data };
                }
            } else {
                this.portfolioData.skills.unshift(data);
            }
            
            // Save and sync
            this.cacheData(); 
            this.notifyPortfolioUpdate(); 
            this.populateSkillsGrid(); 
            this.updateStats();
            
            // Persist via mock API
            try {
                if (isEditing && window.mockAPI?.updateSkill) {
                    await window.mockAPI.updateSkill(data);
                } else if (window.mockAPI?.addSkill) {
                    await window.mockAPI.addSkill(data);
                }
            } catch (apiError) {
                console.warn('API call failed:', apiError);
            }
            
            // Reset form
            form.reset();
            if (isEditing) {
                delete form.dataset.editingId; 
                this.editingSkillId = null;
                const submitBtn = form.querySelector('button[type="submit"]'); 
                if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Skill';
            }
            
            this.showToast(isEditing ? 'Skill updated successfully!' : 'Skill added successfully!', 'success');
            this.markSavedChanges();
            
        } catch (err) {
            console.error('Skill save error', err);
            this.showToast('Failed to save skill. Please try again.', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    populateSkillsGrid() {
        const grid = document.getElementById('skills-grid'); 
        if (!grid) return;
        
        if (!this.portfolioData.skills || this.portfolioData.skills.length === 0) {
            grid.innerHTML = '<div style="text-align:center; padding:2rem; color:#94a3b8;"><i class="fas fa-code" style="font-size:2rem; margin-bottom:1rem;"></i><br>No skills added yet. Add your first skill!</div>';
            return;
        }
        
        // Group skills by category
        const skillsByCategory = this.groupBy(this.portfolioData.skills, 'category');
        
        grid.innerHTML = Object.entries(skillsByCategory).map(([category, skills]) => `
            <div class="skill-category-section" style="background:#0b1222; border:1px solid #1f2937; border-radius:.75rem; padding:1rem; margin-bottom:1rem;">
                <h5 style="margin:0 0 1rem; color:#e2e8f0; border-bottom:1px solid #1f2937; padding-bottom:.5rem;">
                    <i class="fas fa-folder"></i> ${category} (${skills.length})
                </h5>
                <div class="skills-in-category">
                    ${skills.map(skill => `
                        <div class="skill-card" style="background:#0f172a; border:1px solid #1f2937; border-radius:.5rem; padding:.75rem; margin-bottom:.5rem;">
                            <div class="skill-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;">
                                <div style="display:flex; align-items:center; gap:.5rem;">
                                    <i class="${skill.iconClass || 'fas fa-code'}" style="color:#3b82f6;"></i>
                                    <strong>${skill.name}</strong>
                                    <span class="level-badge" style="background:#1f2937; padding:.1rem .4rem; border-radius:.3rem; font-size:.75rem;">${skill.level}</span>
                                </div>
                                <div class="card-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editSkill(${skill.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteSkillHandler(${skill.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="skill-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width:${skill.proficiencyPercentage || 75}%"></div>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:.8rem; color:#94a3b8; margin-top:.3rem;">
                                    <span>${skill.proficiencyPercentage || 75}% proficiency</span>
                                    ${skill.yearsOfExperience ? `<span>${skill.yearsOfExperience} years experience</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    editSkill(id) {
        const skill = this.portfolioData.skills.find(s => s.id === id);
        if (!skill) { this.showToast('Skill not found', 'error'); return; }
        
        const form = document.getElementById('skill-form'); 
        if (!form) return;
        
        // Fill form with skill data
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        setVal('skill-name', skill.name);
        setVal('skill-category', skill.category);
        setVal('skill-level', skill.level);
        setVal('skill-percentage', skill.proficiencyPercentage);
        setVal('skill-experience', skill.yearsOfExperience);
        setVal('skill-icon', skill.iconClass);
        
        this.editingSkillId = id;
        form.dataset.editingId = String(id);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Skill';
        
        this.showSection('skills');
        this.showToast('Editing skill. Make changes and click Update.', 'info');
    }

    async deleteSkillHandler(id) {
        if (!confirm('Delete this skill?')) return;
        
        const before = this.portfolioData.skills.length;
        this.portfolioData.skills = this.portfolioData.skills.filter(s => s.id !== id);
        if (this.portfolioData.skills.length === before) return;
        
        this.cacheData(); 
        this.notifyPortfolioUpdate(); 
        this.populateSkillsGrid(); 
        this.updateStats();
        
        // Clear form if editing this skill
        const form = document.getElementById('skill-form');
        if (this.editingSkillId === id && form) {
            form.reset(); 
            delete form.dataset.editingId; 
            this.editingSkillId = null;
            const submitBtn = form.querySelector('button[type="submit"]'); 
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Skill';
        }
        
        try { 
            if (window.mockAPI?.deleteSkill) await window.mockAPI.deleteSkill(id); 
        } catch {}
        
        this.showToast('Skill deleted', 'success');
    }

    async handleGeneralSettingsSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        
        const settings = {
            siteTitle: fd.get('siteTitle')?.toString().trim() || '',
            tagline: fd.get('tagline')?.toString().trim() || '',
            themeColor: fd.get('themeColor') || '#3b82f6',
            contactEmail: fd.get('contactEmail')?.toString().trim() || '',
            updatedDate: new Date().toISOString()
        };
        
        try {
            this.showLoading(true);
            
            // Save settings to localStorage
            localStorage.setItem('portfolioSettings', JSON.stringify(settings));
            
            // Update portfolio data if needed
            if (this.portfolioData.profile) {
                if (settings.contactEmail) this.portfolioData.profile.email = settings.contactEmail;
                this.cacheData();
                this.notifyPortfolioUpdate();
            }
            
            this.showToast('Settings saved successfully!', 'success');
            this.markSavedChanges();
            
        } catch (err) {
            console.error('Settings save error', err);
            this.showToast('Failed to save settings', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    async handleSecuritySettingsSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        
        const currentPassword = fd.get('currentPassword')?.toString() || '';
        const newPassword = fd.get('newPassword')?.toString() || '';
        const confirmPassword = fd.get('confirmPassword')?.toString() || '';
        
        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showToast('All password fields are required', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showToast('New password and confirmation do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showToast('New password must be at least 6 characters long', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // In a real app, this would validate current password against server
            // For demo purposes, we'll just update the stored credentials
            const currentCredentials = {
                email: 'admin@portfolio.com',
                password: newPassword, // In real app, this would be hashed
                updatedDate: new Date().toISOString()
            };
            
            localStorage.setItem('adminCredentials', JSON.stringify(currentCredentials));
            
            this.showToast('Password updated successfully!', 'success');
            form.reset();
            this.markSavedChanges();
            
        } catch (err) {
            console.error('Password update error', err);
            this.showToast('Failed to update password', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    // Helper utility function
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'Other';
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    }

    // Section navigation functionality
    showSection(section) {
        // Update current section
        this.currentSection = section;
        
        // Hide all sections
        document.querySelectorAll('[data-content-section]').forEach(sec => {
            sec.classList.add('hidden');
        });
        
        // Show the selected section
        const targetSection = document.querySelector(`[data-content-section="${section}"]`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Update navigation active state
        document.querySelectorAll('[data-section]').forEach(nav => {
            nav.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-section="${section}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        // Update URL hash without triggering navigation
        if (location.hash !== `#${section}`) {
            history.replaceState(null, '', `#${section}`);
        }
        
        // Special actions for certain sections
        if (section === 'dashboard') {
            this.updateStats();
            this.loadRecentActivity();
        } else if (section === 'projects') {
            this.populateProjectsGrid();
        } else if (section === 'achievements') {
            this.populateAchievementsGrid();
        } else if (section === 'education') {
            this.populateEducationTimeline();
        } else if (section === 'skills') {
            this.populateSkillsGrid();
        } else if (section === 'messages') {
            this.populateMessagesGrid();
            this.updateMessageStats();
        } else if (section === 'profile') {
            this.populateProfileForm();
        } else if (section === 'about') {
            this.populateAboutForm();
        }
        
        console.log(`Switched to section: ${section}`);
    }

    // Handle URL hash navigation
    handleHashNavigation() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.showSection(hash);
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) { 
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { 
            e.preventDefault(); 
            if (this.hasUnsavedChanges) this.saveDraft(); 
        }
        
        // Quick navigation shortcuts
        if (e.altKey) {
            switch(e.key) {
                case '1': this.showSection('dashboard'); break;
                case '2': this.showSection('profile'); break;
                case '3': this.showSection('about'); break;
                case '4': this.showSection('skills'); break;
                case '5': this.showSection('projects'); break;
                case '6': this.showSection('education'); break;
                case '7': this.showSection('achievements'); break;
                case '8': this.showSection('messages'); break;
                case '9': this.showSection('settings'); break;
            }
        }
    }

    // Profile & About handlers
    async handleProfileSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        
        const updated = {
            ...(this.portfolioData.profile || {}),
            fullName: fd.get('fullName')?.toString().trim() || '',
            title: fd.get('title')?.toString().trim() || '',
            description: fd.get('description')?.toString().trim() || '',
            email: fd.get('email')?.toString().trim() || '',
            phone: fd.get('phone')?.toString().trim() || '',
            location: fd.get('location')?.toString().trim() || '',
            website: fd.get('website')?.toString().trim() || '',
            linkedInUrl: fd.get('linkedInUrl')?.toString().trim() || '',
            gitHubUrl: fd.get('gitHubUrl')?.toString().trim() || '',
            twitterUrl: fd.get('twitterUrl')?.toString().trim() || '',
            facebookUrl: fd.get('facebookUrl')?.toString().trim() || '',
            instagramUrl: fd.get('instagramUrl')?.toString().trim() || '',
            whatsAppNumber: fd.get('whatsAppNumber')?.toString().trim() || '',
            profileImageUrl: fd.get('profileImageUrl')?.toString().trim() || (document.getElementById('profile-preview')?.src || ''),
            updatedDate: new Date().toISOString(),
            id: this.portfolioData.profile?.id || 1,
            createdDate: this.portfolioData.profile?.createdDate || new Date().toISOString()
        };
        
        try {
            this.showLoading(true);
            this.portfolioData.profile = updated;
            
            if (window.mockAPI?.updateProfile) {
                const saved = await window.mockAPI.updateProfile(updated);
                if (saved) this.portfolioData.profile = saved;
            }
            
            this.cacheData(); 
            this.notifyPortfolioUpdate();
            this.populateProfileForm();
            this.showToast('Profile saved successfully!', 'success');
            this.markSavedChanges();
        } catch (err) {
            console.error('Profile save error', err);
            this.showToast('Failed to save profile', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    async handleAboutSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        
        const aboutData = {
            aboutContent: fd.get('aboutContent')?.toString().trim() || '',
            summary: fd.get('summary')?.toString().trim() || '',
            yearsOfExperience: Number(fd.get('yearsOfExperience')) || 0,
            currentRole: fd.get('currentRole')?.toString().trim() || ''
        };
        
        if (!this.portfolioData.profile) this.portfolioData.profile = { id: 1 };
        
        // Merge about data with profile
        Object.assign(this.portfolioData.profile, aboutData);
        this.portfolioData.profile.updatedDate = new Date().toISOString();
        
        try {
            this.showLoading(true);
            if (window.mockAPI?.updateProfile) {
                const saved = await window.mockAPI.updateProfile(this.portfolioData.profile);
                if (saved) this.portfolioData.profile = saved;
            }
            this.cacheData(); 
            this.notifyPortfolioUpdate();
            this.showToast('About content saved successfully!', 'success');
            this.markSavedChanges();
        } catch (err) {
            console.error('About save error', err);
            this.showToast('Failed to save about content', 'error');
        } finally { 
            this.showLoading(false); 
        }
    }

    populateEducationTimeline() {
        const timeline = document.getElementById('education-timeline'); 
        if (!timeline) return;
        
        if (!this.portfolioData.education || this.portfolioData.education.length === 0) {
            timeline.innerHTML = '<div style="text-align:center; padding:2rem; color:#94a3b8;"><i class="fas fa-graduation-cap" style="font-size:2rem; margin-bottom:1rem;"></i><br>No education records yet. Add your first qualification!</div>';
            return;
        }
        
        // Sort education by start date (most recent first)
        const sortedEducation = [...this.portfolioData.education].sort((a, b) => {
            const dateA = new Date(a.startDate || '1900-01-01');
            const dateB = new Date(b.startDate || '1900-01-01');
            return dateB - dateA;
        });

        timeline.innerHTML = sortedEducation.map(edu => {
            // Calculate duration display
            let duration = edu.duration;
            if (!duration && edu.startDate) {
                const startYear = new Date(edu.startDate).getFullYear();
                const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : (edu.current ? 'Present' : '');
                duration = endYear ? `${startYear} - ${endYear}` : startYear.toString();
            }

            return `
                <div class="education-card" data-id="${edu.id}" data-level="${edu.level || 'Bachelor'}">
                    <div class="education-header">
                        <h4><i class="fas fa-graduation-cap"></i> ${edu.degree || 'Untitled'}</h4>
                        <div class="education-badges">
                            <span class="level-badge level-${(edu.level || 'bachelor').toLowerCase().replace(' ', '-')}">${edu.level || 'Bachelor'}</span>
                            ${edu.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                            ${edu.current ? '<span class="current-badge"><i class="fas fa-clock"></i> Current</span>' : ''}
                        </div>
                    </div>
                    <p class="education-school"><strong><i class="fas fa-university"></i> ${edu.school || 'Institution'}</strong></p>
                    ${edu.fieldOfStudy ? `<p class="education-field"><i class="fas fa-book"></i> Field: ${edu.fieldOfStudy}</p>` : ''}
                    ${edu.location ? `<p class="education-location"><i class="fas fa-map-marker-alt"></i> ${edu.location}</p>` : ''}
                    ${duration ? `<p class="education-duration"><i class="fas fa-calendar"></i> ${duration}</p>` : ''}
                    ${edu.gpa ? `<p class="education-gpa"><i class="fas fa-star"></i> GPA: ${edu.gpa}</p>` : ''}
                    ${edu.honors ? `<p class="education-honors"><i class="fas fa-medal"></i> ${edu.honors}</p>` : ''}
                    ${edu.description ? `<p class="education-description">${edu.description}</p>` : ''}
                    ${edu.coursework ? `<div class="education-coursework"><strong>Relevant Coursework:</strong> ${edu.coursework}</div>` : ''}
                    <div class="card-actions">
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editEducation(${edu.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteEducationHandler(${edu.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    populateMessagesGrid() {
        const grid = document.getElementById('messages-list'); 
        if (!grid) return;
        
        if (!this.portfolioData.contacts || this.portfolioData.contacts.length === 0) {
            grid.innerHTML = '<div style="text-align:center; padding:2rem; color:#94a3b8;"><i class="fas fa-inbox" style="font-size:2rem; margin-bottom:1rem;"></i><br>No messages yet.</div>';
            return;
        }
        
        // Sort messages by date (newest first)
        const sortedMessages = [...this.portfolioData.contacts].sort((a, b) => {
            const dateA = new Date(a.createdDate || a.date || new Date());
            const dateB = new Date(b.createdDate || b.date || new Date());
            return dateB - dateA;
        });

        grid.innerHTML = sortedMessages.map(message => {
            const timeAgo = this.getRelativeTime(message.createdDate || message.date || new Date());
            const isUnread = !message.isRead;
            
            return `
                <div class="message-card ${isUnread ? 'unread' : ''}" data-id="${message.id}">
                    <div class="message-header">
                        <h4>
                            ${isUnread ? '<span class="unread-indicator"></span>' : ''}
                            <i class="fas fa-envelope"></i> 
                            ${message.name || 'Anonymous'}
                        </h4>
                        <span class="message-time">${timeAgo}</span>
                    </div>
                    <div class="message-content">
                        <p class="message-email"><strong>Email:</strong> ${message.email || 'No email provided'}</p>
                        ${message.subject ? `<p class="message-subject"><strong>Subject:</strong> ${message.subject}</p>` : ''}
                        <p class="message-text">${message.message || 'No message content'}</p>
                    </div>
                    <div class="card-actions">
                        ${isUnread ? `<button class="btn btn-sm btn-success" onclick="adminDashboard.markAsRead(${message.id})">
                            <i class="fas fa-envelope-open"></i> Mark Read
                        </button>` : ''}
                        <button class="btn btn-sm btn-info" onclick="window.open('mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || 'Your Message')}&body=Hi ${encodeURIComponent(message.name || 'there')},%0A%0A')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteMessage(${message.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.updateMessageStats();
    }
}

// Instantiate and expose globally
const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;