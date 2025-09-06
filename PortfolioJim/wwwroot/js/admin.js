// Admin Authentication and Management
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

        // Hide login modal after delay
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
        // In a real application, you might check user IP, specific URLs, etc.
        const showAdmin = this.shouldShowAdminAccess();
        
        if (showAdmin) {
            const adminNavItem = document.getElementById('admin-nav-item');
            const adminAccessBtn = document.getElementById('admin-access-btn');
            
            if (adminNavItem) adminNavItem.style.display = 'block';
            if (adminAccessBtn) adminAccessBtn.style.display = 'inline-block';
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

    showAdminFeatures() {
        if (!this.isLoggedIn) return;

        // Add admin indicator to the page
        this.addAdminIndicator();

        // Show admin-only features
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'block';
        });

        // Add admin menu to navigation
        this.addAdminMenu();
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

    addAdminMenu() {
        const nav = document.querySelector('.nav-links');
        if (!nav || document.querySelector('.admin-menu-item')) return;

        const adminMenuItem = document.createElement('li');
        adminMenuItem.className = 'admin-menu-item';
        adminMenuItem.innerHTML = `
            <a href="admin.html" class="nav-link admin-link">
                <i class="fas fa-cogs"></i> Dashboard
            </a>
        `;

        nav.appendChild(adminMenuItem);
    }

    showAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus on email field
            const emailField = document.getElementById('admin-email');
            if (emailField) {
                setTimeout(() => emailField.focus(), 100);
            }
        }
    }

    hideAdminLogin() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.style.display = 'none';
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
            loginBtn.style.background = '#10b981';
        }
    }

    hideLoginSuccess() {
        const loginBtn = document.querySelector('.admin-login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.disabled = false;
            loginBtn.style.background = '';
        }
    }

    redirectToAdmin() {
        // Redirect to admin panel
        window.location.href = 'admin.html';
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

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    removeAdminFeatures() {
        // Remove admin indicator
        const indicator = document.querySelector('.admin-indicator');
        if (indicator) indicator.remove();

        // Hide admin menu
        const adminMenuItem = document.querySelector('.admin-menu-item');
        if (adminMenuItem) adminMenuItem.remove();

        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    showLogoutMessage() {
        // Create and show logout toast
        const toast = document.createElement('div');
        toast.className = 'admin-toast logout-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>Successfully logged out</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
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
