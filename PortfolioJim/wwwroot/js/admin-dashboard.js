// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {
            profile: {
                fullName: 'MD. Jahid Hasan Jim',
                title: 'Full Stack Developer & Software Engineer',
                description: 'Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.',
                profileImage: 'images/portfolio.jpg',
                linkedin: 'https://www.linkedin.com/in/md-jahid-hasan-jim/',
                github: 'https://github.com/jim2107054',
                facebook: 'https://facebook.com/jahid.hasan.jim',
                whatsapp: '+8801581705456'
            },
            projects: [
                {
                    id: 1,
                    title: 'E-Commerce Platform',
                    description: 'A full-stack e-commerce solution with React frontend and Node.js backend',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
                    status: 'Completed',
                    demoUrl: 'https://demo.example.com',
                    githubUrl: 'https://github.com/example/repo',
                    imageUrl: 'https://via.placeholder.com/300x200'
                },
                {
                    id: 2,
                    title: 'Task Management App',
                    description: 'A modern task management application with real-time collaboration',
                    technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
                    status: 'In Progress',
                    demoUrl: 'https://demo2.example.com',
                    githubUrl: 'https://github.com/example/repo2',
                    imageUrl: 'https://via.placeholder.com/300x200'
                }
            ],
            achievements: [
                {
                    id: 1,
                    title: 'AWS Certified Developer',
                    organization: 'Amazon Web Services',
                    date: '2023-06-15',
                    description: 'Certified in developing applications on AWS platform',
                    certificateUrl: 'https://certificate.example.com'
                },
                {
                    id: 2,
                    title: 'Best Innovation Award',
                    organization: 'Tech Conference 2023',
                    date: '2023-03-20',
                    description: 'Awarded for innovative solution in healthcare technology',
                    certificateUrl: ''
                }
            ],
            messages: [
                {
                    id: 1,
                    name: 'John Smith',
                    email: 'john@example.com',
                    subject: 'Project Inquiry',
                    message: 'I would like to discuss a potential project collaboration.',
                    date: '2024-01-15T10:30:00',
                    status: 'unread'
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    subject: 'Job Opportunity',
                    message: 'We have an exciting opportunity that might interest you.',
                    date: '2024-01-14T14:20:00',
                    status: 'read'
                }
            ],
            activities: [
                {
                    type: 'project',
                    message: 'Added new project "E-Commerce Platform"',
                    time: '2 hours ago',
                    icon: 'fas fa-plus'
                },
                {
                    type: 'message',
                    message: 'New contact message from John Smith',
                    time: '4 hours ago',
                    icon: 'fas fa-envelope'
                },
                {
                    type: 'achievement',
                    message: 'Updated achievement "AWS Certified Developer"',
                    time: '1 day ago',
                    icon: 'fas fa-trophy'
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.loadEventListeners();
        this.updateDashboardStats();
        this.renderProjects();
        this.renderAchievements();
        this.renderMessages();
        this.renderRecentActivity();
        this.loadProfileData();
    }

    loadEventListeners() {
        // Form submissions
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('achievement-form')?.addEventListener('submit', (e) => this.handleAchievementSubmit(e));

        // Image preview
        document.getElementById('profile-image')?.addEventListener('change', (e) => this.handleImagePreview(e));
    }

    // Navigation
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

        // Find and activate the corresponding nav item
        const navLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
        if (navLink) {
            navLink.closest('.nav-item').classList.add('active');
        }

        this.currentSection = sectionId;
    }

    // Dashboard Stats
    updateDashboardStats() {
        document.getElementById('projects-count').textContent = this.data.projects.length;
        document.getElementById('achievements-count').textContent = this.data.achievements.length;
        document.getElementById('skills-count').textContent = '12'; // You can make this dynamic
        document.getElementById('messages-count').textContent = this.data.messages.filter(m => m.status === 'unread').length;
    }

    // Profile Management
    loadProfileData() {
        const profile = this.data.profile;
        document.getElementById('full-name').value = profile.fullName;
        document.getElementById('title').value = profile.title;
        document.getElementById('description').value = profile.description;
        document.getElementById('linkedin').value = profile.linkedin;
        document.getElementById('github').value = profile.github;
        document.getElementById('facebook').value = profile.facebook;
        document.getElementById('whatsapp').value = profile.whatsapp;
        document.getElementById('profile-preview').src = profile.profileImage;
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        this.showLoading();

        const formData = new FormData(e.target);
        const profileData = Object.fromEntries(formData);

        // Update data
        Object.assign(this.data.profile, profileData);

        setTimeout(() => {
            this.hideLoading();
            this.showToast('Profile updated successfully!', 'success');
            this.addActivity('profile', 'Updated profile information');
        }, 1000);
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profile-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Projects Management
    renderProjects() {
        const container = document.getElementById('projects-grid');
        if (!container) return;

        container.innerHTML = this.data.projects.map(project => `
            <div class="project-card">
                <img src="${project.imageUrl}" alt="${project.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="project-meta">
                    <span class="status-tag status-${project.status.toLowerCase().replace(' ', '')}">${project.status}</span>
                </div>
                <div class="tech-tags" style="margin: 0.5rem 0;">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.editProject(${project.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-sm btn-secondary">
                        <i class="fas fa-external-link-alt"></i> Demo
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        this.showLoading();

        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData);
        
        // Convert technologies string to array
        projectData.technologies = projectData.technologies.split(',').map(tech => tech.trim());
        projectData.id = Date.now(); // Simple ID generation

        this.data.projects.unshift(projectData);
        
        setTimeout(() => {
            this.hideLoading();
            this.renderProjects();
            this.updateDashboardStats();
            e.target.reset();
            this.showToast('Project added successfully!', 'success');
            this.addActivity('project', `Added new project "${projectData.title}"`);
        }, 1000);
    }

    editProject(id) {
        const project = this.data.projects.find(p => p.id === id);
        if (project) {
            // Fill form with project data
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-technologies').value = project.technologies.join(', ');
            document.getElementById('project-status').value = project.status;
            document.getElementById('project-demo').value = project.demoUrl || '';
            document.getElementById('project-github').value = project.githubUrl || '';
            document.getElementById('project-image').value = project.imageUrl || '';
            
            // Scroll to form
            document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.data.projects = this.data.projects.filter(p => p.id !== id);
            this.renderProjects();
            this.updateDashboardStats();
            this.showToast('Project deleted successfully!', 'success');
            this.addActivity('project', 'Deleted a project');
        }
    }

    // Achievements Management
    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        container.innerHTML = this.data.achievements.map(achievement => `
            <div class="achievement-card">
                <h4>${achievement.title}</h4>
                <p><strong>${achievement.organization}</strong></p>
                <p class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</p>
                <p>${achievement.description}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.editAchievement(${achievement.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteAchievement(${achievement.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${achievement.certificateUrl ? `<a href="${achievement.certificateUrl}" target="_blank" class="btn btn-sm btn-secondary">
                        <i class="fas fa-certificate"></i> Certificate
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    }

    handleAchievementSubmit(e) {
        e.preventDefault();
        this.showLoading();

        const formData = new FormData(e.target);
        const achievementData = Object.fromEntries(formData);
        achievementData.id = Date.now();

        this.data.achievements.unshift(achievementData);
        
        setTimeout(() => {
            this.hideLoading();
            this.renderAchievements();
            this.updateDashboardStats();
            e.target.reset();
            this.showToast('Achievement added successfully!', 'success');
            this.addActivity('achievement', `Added new achievement "${achievementData.title}"`);
        }, 1000);
    }

    editAchievement(id) {
        const achievement = this.data.achievements.find(a => a.id === id);
        if (achievement) {
            document.getElementById('achievement-title').value = achievement.title;
            document.getElementById('achievement-organization').value = achievement.organization;
            document.getElementById('achievement-date').value = achievement.date;
            document.getElementById('achievement-description').value = achievement.description;
            document.getElementById('achievement-certificate').value = achievement.certificateUrl || '';
            
            document.getElementById('achievement-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    deleteAchievement(id) {
        if (confirm('Are you sure you want to delete this achievement?')) {
            this.data.achievements = this.data.achievements.filter(a => a.id !== id);
            this.renderAchievements();
            this.updateDashboardStats();
            this.showToast('Achievement deleted successfully!', 'success');
            this.addActivity('achievement', 'Deleted an achievement');
        }
    }

    // Messages Management
    renderMessages() {
        const container = document.getElementById('messages-list');
        if (!container) return;

        container.innerHTML = this.data.messages.map(message => `
            <div class="message-card ${message.status === 'unread' ? 'unread' : ''}">
                <div class="message-header">
                    <div class="message-info">
                        <h4>${message.name}</h4>
                        <p>${message.email} • ${message.subject}</p>
                    </div>
                    <span class="message-date">${new Date(message.date).toLocaleDateString()}</span>
                </div>
                <div class="message-content">
                    ${message.message}
                </div>
                <div class="message-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.markAsRead(${message.id})">
                        <i class="fas fa-eye"></i> Mark as Read
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.replyToMessage(${message.id})">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteMessage(${message.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    markAsRead(id) {
        const message = this.data.messages.find(m => m.id === id);
        if (message) {
            message.status = 'read';
            this.renderMessages();
            this.updateDashboardStats();
            this.showToast('Message marked as read', 'success');
        }
    }

    replyToMessage(id) {
        const message = this.data.messages.find(m => m.id === id);
        if (message) {
            const emailSubject = `Re: ${message.subject}`;
            const emailBody = `Hello ${message.name},\n\nThank you for your message.\n\nBest regards,\nMD. Jahid Hasan Jim`;
            window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        }
    }

    deleteMessage(id) {
        if (confirm('Are you sure you want to delete this message?')) {
            this.data.messages = this.data.messages.filter(m => m.id !== id);
            this.renderMessages();
            this.updateDashboardStats();
            this.showToast('Message deleted successfully!', 'success');
        }
    }

    // Recent Activity
    renderRecentActivity() {
        const container = document.getElementById('activity-list');
        if (!container) return;

        container.innerHTML = this.data.activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: #dbeafe; color: #2563eb;">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    addActivity(type, message) {
        const iconMap = {
            'profile': 'fas fa-user',
            'project': 'fas fa-project-diagram',
            'achievement': 'fas fa-trophy',
            'message': 'fas fa-envelope',
            'skill': 'fas fa-code'
        };

        this.data.activities.unshift({
            type,
            message,
            time: 'Just now',
            icon: iconMap[type] || 'fas fa-info'
        });

        this.renderRecentActivity();
    }

    // Utility Functions
    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Export/Import Functions
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        this.data = { ...this.data, ...importedData };
                        this.init();
                        this.showToast('Data imported successfully!', 'success');
                    } catch (error) {
                        this.showToast('Error importing data. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    clearCache() {
        if (confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
            localStorage.clear();
            sessionStorage.clear();
            this.showToast('Cache cleared successfully!', 'success');
        }
    }
}

// Global functions for onclick handlers
function showSection(sectionId) {
    adminDashboard.showSection(sectionId);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/';
    }
}

function exportData() {
    adminDashboard.exportData();
}

function importData() {
    adminDashboard.importData();
}

function clearCache() {
    adminDashboard.clearCache();
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});