// Admin Authentication and Management - Enhanced Modal Version
class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.adminCredentials = {
            email: 'admin@portfolio.com',
            password: 'admin123'
        };
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.showAdminAccess();
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
    }

    checkExistingSession() {
        const savedSession = localStorage.getItem('adminSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const now = new Date().getTime();
                
                // Check if session is still valid (24 hours)
                if (session.expires > now) {
                    this.currentUser = session.user;
                    this.isLoggedIn = true;
                    this.showAdminFeatures();
                } else {
                    localStorage.removeItem('adminSession');
                }
            } catch (error) {
                localStorage.removeItem('adminSession');
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

        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
            this.loginSuccess(email);
        } else {
            this.loginError();
        }

        this.showLoginLoading(false);
    }

    loginSuccess(email) {
        this.currentUser = { email };
        this.isLoggedIn = true;

        // Save session to localStorage
        const session = {
            user: this.currentUser,
            expires: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('adminSession', JSON.stringify(session));

        // Show success message
        this.showLoginSuccess();

        // Hide login modal after delay and redirect
        setTimeout(() => {
            this.hideAdminLogin();
            this.showAdminFeatures();
            this.redirectToAdmin();
        }, 1500);
    }

    loginError() {
        this.showLoginError();
        // Clear password field
        const passwordField = document.getElementById('admin-password');
        if (passwordField) {
            passwordField.value = '';
            passwordField.focus();
        }
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
        // 4. Special key combination was pressed

        if (this.isLoggedIn) return true;
        
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) return true;

        return false;
    }

    showAdminButton() {
        const adminNavItem = document.getElementById('admin-nav-item');
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        
        if (adminNavItem) adminNavItem.style.display = 'block';
        if (dashboardNavItem) dashboardNavItem.style.display = 'none';
    }

    showDashboardButton() {
        const adminNavItem = document.getElementById('admin-nav-item');
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        
        if (adminNavItem) adminNavItem.style.display = 'none';
        if (dashboardNavItem) dashboardNavItem.style.display = 'block';
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
    }

    addAdminIndicator() {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.admin-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create admin indicator
        const indicator = document.createElement('div');
        indicator.className = 'admin-indicator';
        indicator.innerHTML = `
            <div class="admin-indicator-content">
                <i class="fas fa-shield-alt"></i>
                <span>Admin Mode</span>
                <button onclick="adminAuth.logout()" class="admin-logout-btn" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(indicator);
    }

    showAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.add('show');
            
            // Focus on email field
            const emailField = document.getElementById('admin-email');
            if (emailField) {
                setTimeout(() => emailField.focus(), 300);
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    hideAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.remove('show');

            // Allow body scroll
            document.body.style.overflow = '';
        }

        // Clear form
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.reset();
        }

        // Hide any messages
        this.hideLoginError();
        this.hideLoginSuccess();
        this.showLoginLoading(false);
    }

    showLoginLoading(show) {
        const loading = document.getElementById('admin-login-loading');
        const loginBtn = document.querySelector('.admin-login-btn');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        
        if (loginBtn) {
            if (show) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            } else {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        }
    }

    showLoginError() {
        const error = document.getElementById('admin-login-error');
        if (error) {
            error.style.display = 'block';
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
            loginBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
            loginBtn.disabled = true;
            loginBtn.classList.add('success');
        }
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
            window.location.href = 'admin.html';
        }, 1000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session
            localStorage.removeItem('adminSession');
            this.currentUser = null;
            this.isLoggedIn = false;

            // Remove admin features
            this.removeAdminFeatures();

            // Show logout message
            this.showLogoutMessage();

            // Reset navbar
            this.showAdminButton();
        }
    }

    removeAdminFeatures() {
        // Remove admin indicator
        const indicator = document.querySelector('.admin-indicator');
        if (indicator) indicator.remove();

        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    showLogoutMessage() {
        this.showToast('Successfully logged out', 'success');
    }

    showToast(message, type = 'info') {
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

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
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
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}
