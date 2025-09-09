// Mock API Service for Portfolio Data
class MockAPIService {
    constructor() {
        this.baseUrl = '/api';
        this.isOnline = navigator.onLine;
        this.setupOfflineHandling();
        this.initializeDefaultData();
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    initializeDefaultData() {
        // Initialize with default data if none exists
        if (!localStorage.getItem('portfolioData')) {
            const defaultData = {
                profile: {
                    id: 1,
                    fullName: "MD. Jahid Hasan Jim",
                    title: "Full Stack Developer & Software Engineer",
                    description: "Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.",
                    aboutContent: `Hello! I'm MD. Jahid Hasan Jim, a passionate full-stack developer with over 3 years of experience creating digital solutions that make a difference. I specialize in modern web technologies and love turning complex problems into simple, beautiful designs.

My journey in software development started during my computer science studies, where I discovered my passion for creating user-centric applications. I have expertise in .NET, React, JavaScript, and cloud technologies.

When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.`,
                    email: "jahid.hasan.jim@gmail.com",
                    linkedInUrl: "https://www.linkedin.com/in/md-jahid-hasan-jim/",
                    gitHubUrl: "https://github.com/jim2107054",
                    facebookUrl: "https://facebook.com/jahid.hasan.jim",
                    whatsAppNumber: "+8801581705456",
                    profileImageUrl: "images/portfolio.jpg",
                    createdDate: new Date().toISOString(),
                    updatedDate: new Date().toISOString()
                },
                skills: [
                    {
                        id: 1,
                        name: "JavaScript",
                        category: "Frontend",
                        level: "Advanced",
                        iconClass: "fab fa-js-square",
                        proficiencyPercentage: 90,
                        yearsOfExperience: 4,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: "React",
                        category: "Frontend",
                        level: "Advanced",
                        iconClass: "fab fa-react",
                        proficiencyPercentage: 85,
                        yearsOfExperience: 3,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 3,
                        name: "Node.js",
                        category: "Backend",
                        level: "Intermediate",
                        iconClass: "fab fa-node-js",
                        proficiencyPercentage: 80,
                        yearsOfExperience: 3,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 4,
                        name: "C#",
                        category: "Languages",
                        level: "Advanced",
                        iconClass: "fas fa-code",
                        proficiencyPercentage: 90,
                        yearsOfExperience: 4,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 5,
                        name: ".NET",
                        category: "Backend",
                        level: "Advanced",
                        iconClass: "fas fa-server",
                        proficiencyPercentage: 85,
                        yearsOfExperience: 4,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 6,
                        name: "SQL Server",
                        category: "Database",
                        level: "Intermediate",
                        iconClass: "fas fa-database",
                        proficiencyPercentage: 75,
                        yearsOfExperience: 3,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 7,
                        name: "Azure",
                        category: "DevOps",
                        level: "Intermediate",
                        iconClass: "fab fa-microsoft",
                        proficiencyPercentage: 70,
                        yearsOfExperience: 2,
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 8,
                        name: "Git",
                        category: "Tools",
                        level: "Advanced",
                        iconClass: "fab fa-git-alt",
                        proficiencyPercentage: 85,
                        yearsOfExperience: 4,
                        createdDate: new Date().toISOString()
                    }
                ],
                projects: [
                    {
                        id: 1,
                        title: "E-commerce Platform",
                        description: "A full-stack e-commerce solution built with React and .NET Core, featuring real-time inventory management, secure payment processing, and advanced analytics dashboard.",
                        technologies: "React, .NET Core, SQL Server, Azure, Stripe API",
                        imageUrl: "images/project1.jpg",
                        demoUrl: "https://demo-ecommerce.example.com",
                        githubUrl: "https://github.com/jim2107054/ecommerce-platform",
                        category: "Web Development",
                        status: "Completed",
                        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        updatedDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        title: "Task Management App",
                        description: "A collaborative task management application with real-time updates, team collaboration features, and advanced project tracking capabilities.",
                        technologies: "React, Node.js, MongoDB, Socket.io, JWT",
                        imageUrl: "images/project2.jpg",
                        demoUrl: "https://demo-taskmanager.example.com",
                        githubUrl: "https://github.com/jim2107054/task-manager",
                        category: "Web Development",
                        status: "Completed",
                        createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                        updatedDate: new Date().toISOString()
                    },
                    {
                        id: 3,
                        title: "Mobile Expense Tracker",
                        description: "Cross-platform mobile app for tracking personal expenses with budget planning, category-wise analysis, and cloud synchronization.",
                        technologies: "React Native, Firebase, Chart.js, Redux",
                        imageUrl: "images/project3.jpg",
                        demoUrl: "https://play.google.com/store/apps/details?id=com.expensetracker",
                        githubUrl: "https://github.com/jim2107054/expense-tracker-mobile",
                        category: "Mobile App",
                        status: "In Progress",
                        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                        updatedDate: new Date().toISOString()
                    },
                    {
                        id: 4,
                        title: "Real Estate Portal",
                        description: "A comprehensive real estate portal with property listings, virtual tours, mortgage calculator, and agent management system.",
                        technologies: ".NET 6, Angular, PostgreSQL, Azure Blob Storage",
                        imageUrl: "images/project4.jpg",
                        demoUrl: "https://demo-realestate.example.com",
                        githubUrl: "https://github.com/jim2107054/real-estate-portal",
                        category: "Web Development",
                        status: "Completed",
                        createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        updatedDate: new Date().toISOString()
                    }
                ],
                education: [
                    {
                        id: 1,
                        degree: "Bachelor of Science in Computer Science",
                        school: "University of Technology",
                        duration: "2019 - 2023",
                        location: "Dhaka, Bangladesh",
                        gpa: "3.8/4.0",
                        description: "Focused on software engineering, web development, and database management systems. Graduated with distinction and received the Dean's List recognition for academic excellence.",
                        startDate: "2019-01-01",
                        endDate: "2023-12-31",
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        degree: "Higher Secondary Certificate (HSC)",
                        school: "Dhaka College",
                        duration: "2017 - 2019",
                        location: "Dhaka, Bangladesh",
                        gpa: "5.0/5.0",
                        description: "Science background with focus on Mathematics, Physics, and Chemistry. Achieved golden GPA and ranked in top 5% of the batch.",
                        startDate: "2017-01-01",
                        endDate: "2019-12-31",
                        createdDate: new Date().toISOString()
                    }
                ],
                achievements: [
                    {
                        id: 1,
                        title: "Microsoft Certified: Azure Developer Associate",
                        organization: "Microsoft",
                        date: "2023-06-15",
                        type: "Certification",
                        level: "Professional",
                        description: "Certified in developing and maintaining cloud applications on Microsoft Azure platform, including app services, functions, and storage solutions.",
                        certificateUrl: "https://www.credly.com/badges/azure-developer-associate",
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        title: "Best Innovation Award",
                        organization: "Tech Conference 2023",
                        date: "2023-03-20",
                        type: "Award",
                        level: "National",
                        description: "Awarded for developing an innovative solution for healthcare data management using AI and blockchain technologies.",
                        certificateUrl: "",
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 3,
                        title: "AWS Certified Solutions Architect",
                        organization: "Amazon Web Services",
                        date: "2023-01-10",
                        type: "Certification",
                        level: "Professional",
                        description: "Certified in designing and deploying scalable, highly available systems on AWS cloud platform.",
                        certificateUrl: "https://www.credly.com/badges/aws-solutions-architect",
                        createdDate: new Date().toISOString()
                    },
                    {
                        id: 4,
                        title: "Hackathon Winner - Smart City Solutions",
                        organization: "Bangladesh ICT Division",
                        date: "2022-11-15",
                        type: "Competition",
                        level: "National",
                        description: "First place winner in the national hackathon for developing a smart traffic management system using IoT and machine learning.",
                        certificateUrl: "",
                        createdDate: new Date().toISOString()
                    }
                ],
                contacts: [
                    {
                        id: 1,
                        name: "John Smith",
                        email: "john.smith@example.com",
                        subject: "Project Collaboration Opportunity",
                        message: "Hi Jahid, I came across your portfolio and I'm impressed with your work. I have a project opportunity that might interest you. Would you be available for a quick discussion?",
                        isRead: false,
                        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 2,
                        name: "Sarah Johnson",
                        email: "sarah.johnson@techcorp.com",
                        subject: "Job Opportunity - Senior Developer",
                        message: "Hello Jahid, We are looking for a senior full-stack developer for our team. Your skills match perfectly with what we're looking for. Are you open to new opportunities?",
                        isRead: false,
                        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 3,
                        name: "Mike Wilson",
                        email: "mike.wilson@startup.io",
                        subject: "Freelance Project Inquiry",
                        message: "Hi there! I saw your e-commerce project and I'm wondering if you'd be interested in building something similar for our startup. Could we schedule a call?",
                        isRead: true,
                        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            };

            localStorage.setItem('portfolioData', JSON.stringify(defaultData));
        }
    }

    // Simulate network delay
    async simulateNetworkDelay(min = 500, max = 1500) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Generic fetch with offline handling
    async mockFetch(url, options = {}) {
        await this.simulateNetworkDelay();

        if (!this.isOnline) {
            throw new Error('Network unavailable');
        }

        // Simulate occasional network errors
        if (Math.random() < 0.1) { // 10% chance of network error
            throw new Error('Network error');
        }

        const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        const method = options.method || 'GET';
        const endpoint = url.replace(this.baseUrl, '').split('/').filter(Boolean);

        switch (method) {
            case 'GET':
                return this.handleGet(endpoint, data);
            case 'POST':
                return this.handlePost(endpoint, data, options.body);
            case 'PUT':
                return this.handlePut(endpoint, data, options.body);
            case 'DELETE':
                return this.handleDelete(endpoint, data);
            default:
                throw new Error(`Method ${method} not supported`);
        }
    }

    handleGet(endpoint, data) {
        const [resource, id] = endpoint;

        if (!resource) {
            return { ok: true, json: () => Promise.resolve(data) };
        }

        if (!data[resource]) {
            return { ok: false, status: 404 };
        }

        if (id) {
            const item = Array.isArray(data[resource]) 
                ? data[resource].find(item => item.id == id)
                : data[resource];
            
            if (!item) {
                return { ok: false, status: 404 };
            }
            
            return { ok: true, json: () => Promise.resolve(item) };
        }

        return { ok: true, json: () => Promise.resolve(data[resource]) };
    }

    handlePost(endpoint, data, body) {
        const [resource] = endpoint;
        
        if (!data[resource] || !Array.isArray(data[resource])) {
            return { ok: false, status: 400 };
        }

        const newItem = JSON.parse(body);
        newItem.id = Date.now();
        newItem.createdDate = new Date().toISOString();
        newItem.updatedDate = new Date().toISOString();

        data[resource].push(newItem);
        this.saveData(data);

        return { ok: true, json: () => Promise.resolve(newItem) };
    }

    handlePut(endpoint, data, body) {
        const [resource, id] = endpoint;
        const updateData = JSON.parse(body);

        if (!data[resource]) {
            return { ok: false, status: 404 };
        }

        if (Array.isArray(data[resource])) {
            const index = data[resource].findIndex(item => item.id == id);
            if (index === -1) {
                return { ok: false, status: 404 };
            }
            
            data[resource][index] = { 
                ...data[resource][index], 
                ...updateData, 
                updatedDate: new Date().toISOString() 
            };
        } else {
            data[resource] = { 
                ...data[resource], 
                ...updateData, 
                updatedDate: new Date().toISOString() 
            };
        }

        this.saveData(data);
        return { ok: true, json: () => Promise.resolve(data[resource]) };
    }

    handleDelete(endpoint, data) {
        const [resource, id] = endpoint;

        if (!data[resource] || !Array.isArray(data[resource])) {
            return { ok: false, status: 404 };
        }

        const index = data[resource].findIndex(item => item.id == id);
        if (index === -1) {
            return { ok: false, status: 404 };
        }

        data[resource].splice(index, 1);
        this.saveData(data);

        return { ok: true, json: () => Promise.resolve({ success: true }) };
    }

    saveData(data) {
        localStorage.setItem('portfolioData', JSON.stringify(data));
        
        // Log the update for admin activity
        const activity = {
            timestamp: new Date().toISOString(),
            action: 'data_update',
            description: 'Portfolio data updated via API'
        };

        const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
        logs.unshift(activity);
        localStorage.setItem('adminActivityLogs', JSON.stringify(logs.slice(0, 50)));
    }

    syncOfflineData() {
        // Sync any offline changes when back online
        const offlineData = localStorage.getItem('offlineQueue');
        if (offlineData) {
            const queue = JSON.parse(offlineData);
            console.log('Syncing offline data:', queue);
            // In a real app, you would process the queue
            localStorage.removeItem('offlineQueue');
        }
    }

    // Public API methods
    async getProfile() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/profile`);
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    }

    async getSkills() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/skills`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
    }

    async addSkill(skillData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skillData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error adding skill:', error);
            return null;
        }
    }

    async deleteSkill(skillId) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/skills/${skillId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting skill:', error);
            return false;
        }
    }

    async getProjects() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/projects`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    }

    async addProject(projectData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error adding project:', error);
            return null;
        }
    }

    async deleteProject(projectId) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/projects/${projectId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    }

    async getAchievements() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/achievements`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }

    async addAchievement(achievementData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/achievements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(achievementData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error adding achievement:', error);
            return null;
        }
    }

    async deleteAchievement(achievementId) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/achievements/${achievementId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting achievement:', error);
            return false;
        }
    }

    async getEducation() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/education`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching education:', error);
            return [];
        }
    }

    async addEducation(educationData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(educationData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error adding education:', error);
            return null;
        }
    }

    async deleteEducation(educationId) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/education/${educationId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting education:', error);
            return false;
        }
    }

    async getContacts() {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/contact`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }
    }

    async addContact(contactData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error adding contact:', error);
            return null;
        }
    }

    async updateContact(contactId, contactData) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/contact/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('Error updating contact:', error);
            return null;
        }
    }

    async deleteContact(contactId) {
        try {
            const response = await this.mockFetch(`${this.baseUrl}/contact/${contactId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting contact:', error);
            return false;
        }
    }
}

// Initialize the mock API service
window.mockAPI = new MockAPIService();

// Override fetch for API calls
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    if (url.startsWith('/api')) {
        return window.mockAPI.mockFetch(url, options);
    }
    return originalFetch.apply(this, arguments);
};

console.log('Mock API Service initialized. Portfolio data available offline.');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockAPIService;
}