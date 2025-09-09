// Enhanced Admin Authentication and Management with Portfolio Integration
class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.adminCredentials = {
            email: 'admin@portfolio.com',
            password: 'admin123'
        };
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.showAdminAccess();
        this.initializePortfolioIntegration();
    }

    setupEventListeners() {
        // Admin login form
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Keyboard shortcuts for admin access
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A to show admin login
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showAdminLogin();
            }

            // Alt + A for quick admin access
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                if (this.isLoggedIn) {
                    window.location.href = 'admin.html';
                } else {
                    this.showAdminLogin();
                }
            }

            // Escape to close modal
            if (e.key === 'Escape') {
                this.hideAdminLogin();
            }
        });

        // Click outside modal to close
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAdminLogin();
                }
            });
        }

        // Listen for logout from admin panel
        window.addEventListener('message', (e) => {
            if (e.data.type === 'adminLogout') {
                this.handleAdminPanelLogout();
            }
        });

        // Listen for admin data updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminSession') {
                this.checkExistingSession();
            }
        });
    }

    initializePortfolioIntegration() {
        // Connect with portfolio manager if available
        if (window.portfolioManager) {
            this.portfolioManager = window.portfolioManager;
        }

        // Set up communication channel
        this.setupPortfolioCommunication();
    }

    setupPortfolioCommunication() {
        // Create a communication bridge between admin and portfolio
        window.addEventListener('adminDataUpdate', (e) => {
            this.handleAdminDataUpdate(e.detail);
        });

        // Notify portfolio of admin state changes
        window.addEventListener('beforeunload', () => {
            if (this.isLoggedIn) {
                this.notifyPortfolioUpdate();
            }
        });
    }

    checkExistingSession() {
        const savedSession = localStorage.getItem('adminSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const now = new Date().getTime();
                
                // Check if session is still valid
                if (session.expires > now) {
                    this.currentUser = session.user;
                    this.isLoggedIn = true;
                    this.showAdminFeatures();
                    this.dispatchAuthStateChange(true);
                } else {
                    localStorage.removeItem('adminSession');
                    this.dispatchAuthStateChange(false);
                }
            } catch (error) {
                localStorage.removeItem('adminSession');
                this.dispatchAuthStateChange(false);
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        this.showLoginLoading(true);
        this.hideLoginError();

        try {
            // Simulate authentication delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials (in production, this would be an API call)
            if (await this.validateCredentials(email, password)) {
                await this.loginSuccess(email);
            } else {
                this.loginError();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.loginError('An error occurred during login. Please try again.');
        } finally {
            this.showLoginLoading(false);
        }
    }

    async validateCredentials(email, password) {
        // In a real application, this would make an API call
        // For demo purposes, we'll check against hardcoded credentials
        return email === this.adminCredentials.email && password === this.adminCredentials.password;
    }

    async loginSuccess(email) {
        this.currentUser = { 
            email,
            loginTime: new Date().toISOString(),
            permissions: ['read', 'write', 'delete'] // Example permissions
        };
        this.isLoggedIn = true;

        // Save session to localStorage with expiration
        const session = {
            user: this.currentUser,
            expires: new Date().getTime() + this.sessionTimeout,
            tokenHash: this.generateSessionToken()
        };
        localStorage.setItem('adminSession', JSON.stringify(session));

        // Show success message
        this.showLoginSuccess();

        // Log the successful login
        this.logAdminActivity('login', 'Admin logged in successfully');

        // Hide login modal after delay and redirect
        setTimeout(() => {
            this.hideAdminLogin();
            this.showAdminFeatures();
            this.dispatchAuthStateChange(true);
            
            // Check if we should redirect to admin panel
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('redirect') === 'admin' || window.location.pathname.includes('admin')) {
                this.redirectToAdmin();
            }
        }, 1500);
    }

    generateSessionToken() {
        // Generate a simple session token (in production, use proper JWT or similar)
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    loginError(message = 'Invalid email or password. Please try again.') {
        this.showLoginError(message);
        
        // Clear password field and focus on it
        const passwordField = document.getElementById('admin-password');
        if (passwordField) {
            passwordField.value = '';
            passwordField.focus();
        }

        // Log failed login attempt
        this.logAdminActivity('login_failed', 'Failed login attempt');
    }

    showAdminAccess() {
        // Show admin access button for specific conditions
        const showAdmin = this.shouldShowAdminAccess();
        
        if (showAdmin) {
            if (this.isLoggedIn) {
                this.showDashboardButton();
            } else {
                this.showAdminButton();
            }
        }
    }

    shouldShowAdminAccess() {
        // Show admin access if:
        // 1. Already logged in
        // 2. On localhost/development environment
        // 3. URL contains admin parameter
        // 4. Development mode is enabled

        if (this.isLoggedIn) return true;
        
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) return true;
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin') || urlParams.has('debug')) return true;

        // Check for development mode flag
        if (localStorage.getItem('devMode') === 'true') return true;

        // For production, you might want to hide this completely or require a special key
        return window.location.hostname.includes('localhost'); // Only show on localhost in production
    }

    showAdminButton() {
        const adminNavItem = document.getElementById('admin-nav-item');
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        
        if (adminNavItem) {
            adminNavItem.style.display = 'flex';
            adminNavItem.classList.add('admin-available');
        }
        if (dashboardNavItem) {
            dashboardNavItem.style.display = 'none';
        }
    }

    showDashboardButton() {
        const adminNavItem = document.getElementById('admin-nav-item');
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        
        if (adminNavItem) {
            adminNavItem.style.display = 'none';
        }
        if (dashboardNavItem) {
            dashboardNavItem.style.display = 'flex';
            dashboardNavItem.classList.add('admin-authenticated');
        }
    }

    showAdminFeatures() {
        if (!this.isLoggedIn) return;

        // Update navbar buttons
        this.showDashboardButton();

        // Add admin indicator to the page
        this.addAdminIndicator();

        // Show admin-only features
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'block';
        });

        // Add admin styles to body
        document.body.classList.add('admin-authenticated');

        // Enable admin features in portfolio
        this.enablePortfolioAdminFeatures();
    }

    enablePortfolioAdminFeatures() {
        // Enable portfolio admin features if portfolio manager is available
        if (window.portfolioManager) {
            window.portfolioManager.showAdminFeatures();
        }

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('adminAuthenticated', {
            detail: { user: this.currentUser }
        }));
    }

    addAdminIndicator() {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.admin-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create enhanced admin indicator
        const indicator = document.createElement('div');
        indicator.className = 'admin-indicator';
        indicator.innerHTML = `
            <div class="admin-indicator-content">
                <div class="admin-status">
                    <i class="fas fa-shield-alt"></i>
                    <div class="admin-info">
                        <span class="admin-label">Admin Mode</span>
                        <span class="admin-user">${this.currentUser.email}</span>
                    </div>
                </div>
                <div class="admin-actions">
                    <button onclick="adminAuth.openAdminPanel()" class="admin-action-btn" title="Open Admin Panel">
                        <i class="fas fa-tachometer-alt"></i>
                    </button>
                    <button onclick="adminAuth.refreshPortfolio()" class="admin-action-btn" title="Refresh Portfolio">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button onclick="adminAuth.logout()" class="admin-logout-btn" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(indicator);

        // Add animation
        setTimeout(() => {
            indicator.classList.add('visible');
        }, 100);
    }

    openAdminPanel() {
        window.open('admin.html', '_blank');
    }

    async refreshPortfolio() {
        if (window.portfolioManager) {
            await window.portfolioManager.refreshFromAdmin();
            this.showToast('Portfolio refreshed!', 'success');
        }
    }

    showAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.add('show');
            
            // Focus on email field with delay for better UX
            const emailField = document.getElementById('admin-email');
            if (emailField) {
                setTimeout(() => {
                    emailField.focus();
                    if (emailField.value) {
                        emailField.select();
                    }
                }, 400);
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Clear any previous error states
            this.hideLoginError();
            this.hideLoginSuccess();
            this.showLoginLoading(false);

            // Add modal animation
            const modalContent = modal.querySelector('.admin-modal-content');
            if (modalContent) {
                modalContent.style.transform = 'scale(0.8)';
                modalContent.style.opacity = '0';
                
                setTimeout(() => {
                    modalContent.style.transform = 'scale(1)';
                    modalContent.style.opacity = '1';
                }, 50);
            }
        }
    }

    hideAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            const modalContent = modal.querySelector('.admin-modal-content');
            
            if (modalContent) {
                modalContent.style.transform = 'scale(0.8)';
                modalContent.style.opacity = '0';
            }

            setTimeout(() => {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }, 200);
        }

        // Clear form with a small delay to avoid flickering
        setTimeout(() => {
            const form = document.getElementById('admin-login-form');
            if (form) {
                form.reset();
            }

            // Hide any messages
            this.hideLoginError();
            this.hideLoginSuccess();
            this.showLoginLoading(false);
        }, 300);
    }

    showLoginLoading(show) {
        const loading = document.getElementById('admin-login-loading');
        const loginBtn = document.querySelector('.admin-login-btn');
        
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
        
        if (loginBtn) {
            if (show) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                loginBtn.classList.remove('success');
            } else {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                loginBtn.classList.remove('success');
            }
        }
    }

    showLoginError(message = 'Invalid email or password. Please try again.') {
        const error = document.getElementById('admin-login-error');
        if (error) {
            error.querySelector('span').textContent = message;
            error.style.display = 'flex';
            
            // Add shake animation
            error.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                error.style.animation = '';
            }, 500);
        }
    }

    hideLoginError() {
        const error = document.getElementById('admin-login-error');
        if (error) {
            error.style.display = 'none';
        }
    }

    showLoginSuccess() {
        const loginBtn = document.querySelector('.admin-login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-check-circle"></i> Login Successful!';
            loginBtn.disabled = true;
            loginBtn.classList.add('success');
        }
        
        // Hide error if visible
        this.hideLoginError();
    }

    hideLoginSuccess() {
        const loginBtn = document.querySelector('.admin-login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.disabled = false;
            loginBtn.classList.remove('success');
        }
    }

    redirectToAdmin() {
        // Show redirect message
        this.showToast('Redirecting to admin dashboard...', 'info');
        
        // Redirect to admin panel after a short delay
        setTimeout(() => {
            if (window.location.pathname.includes('admin.html')) {
                window.location.reload();
            } else {
                window.location.href = 'admin.html';
            }
        }, 1000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.performLogout();
        }
    }

    performLogout() {
        // Log the logout activity
        this.logAdminActivity('logout', 'Admin logged out');

        // Clear session
        localStorage.removeItem('adminSession');
        sessionStorage.clear();
        
        this.currentUser = null;
        this.isLoggedIn = false;

        // Remove admin features
        this.removeAdminFeatures();

        // Show logout message
        this.showLogoutMessage();

        // Reset navbar
        this.showAdminButton();

        // Dispatch auth state change
        this.dispatchAuthStateChange(false);

        // Notify portfolio of logout
        if (window.portfolioManager) {
            window.portfolioManager.hideAdminFeatures();
        }

        // If on admin page, redirect to portfolio
        if (window.location.pathname.includes('admin.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    handleAdminPanelLogout() {
        // Handle logout initiated from admin panel
        this.performLogout();
    }

    removeAdminFeatures() {
        // Remove admin indicator
        const indicator = document.querySelector('.admin-indicator');
        if (indicator) {
            indicator.classList.remove('visible');
            setTimeout(() => indicator.remove(), 300);
        }

        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });

        // Remove admin styles from body
        document.body.classList.remove('admin-authenticated');

        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('adminLogout'));
    }

    showLogoutMessage() {
        this.showToast('Successfully logged out', 'success');
    }

    dispatchAuthStateChange(isAuthenticated) {
        // Dispatch auth state change event for other components
        window.dispatchEvent(new CustomEvent('adminStateChange', {
            detail: { 
                isAuthenticated,
                user: this.currentUser 
            }
        }));
    }

    logAdminActivity(action, description) {
        const activity = {
            action,
            description,
            timestamp: new Date().toISOString(),
            user: this.currentUser?.email || 'anonymous',
            ip: '127.0.0.1', // In production, get real IP
            userAgent: navigator.userAgent
        };

        // Store in localStorage (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
        logs.unshift(activity);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }
        
        localStorage.setItem('adminLogs', JSON.stringify(logs));

        console.log('Admin Activity:', activity);
    }

    handleAdminDataUpdate(data) {
        // Handle data updates from admin panel
        if (window.portfolioManager) {
            window.portfolioManager.handleDataUpdate(data);
        }
    }

    notifyPortfolioUpdate() {
        // Notify portfolio of any updates when leaving admin
        window.dispatchEvent(new CustomEvent('adminDataUpdate', {
            detail: { timestamp: new Date().toISOString() }
        }));
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.admin-toast');
        existingToasts.forEach(toast => toast.remove());

        // Create and show toast
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}-toast`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Add animation
        setTimeout(() => {
            toast.classList.add('visible');
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
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

    // Public methods for global access
    isAuthenticated() {
        return this.isLoggedIn;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth() {
        if (!this.isLoggedIn) {
            this.showAdminLogin();
            return false;
        }
        return true;
    }

    hasPermission(permission) {
        return this.currentUser?.permissions?.includes(permission) || false;
    }

    getSessionInfo() {
        if (!this.isLoggedIn) return null;
        
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        return {
            user: this.currentUser,
            loginTime: this.currentUser?.loginTime,
            expiresAt: new Date(session.expires),
            timeRemaining: session.expires - new Date().getTime()
        };
    }

    extendSession() {
        if (this.isLoggedIn) {
            const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
            session.expires = new Date().getTime() + this.sessionTimeout;
            localStorage.setItem('adminSession', JSON.stringify(session));
            
            this.showToast('Session extended', 'info');
        }
    }
}

// Global functions for HTML onclick handlers
function showAdminLogin() {
    if (window.adminAuth) {
        window.adminAuth.showAdminLogin();
    }
}

function hideAdminLogin() {
    if (window.adminAuth) {
        window.adminAuth.hideAdminLogin();
    }
}

// Initialize admin authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
    
    // Auto-extend session on user activity
    let activityTimer;
    ['click', 'scroll', 'keypress'].forEach(event => {
        document.addEventListener(event, () => {
            if (window.adminAuth?.isAuthenticated()) {
                clearTimeout(activityTimer);
                activityTimer = setTimeout(() => {
                    window.adminAuth.extendSession();
                }, 30 * 60 * 1000); // Extend after 30 minutes of activity
            }
        });
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
