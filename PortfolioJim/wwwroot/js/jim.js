
    const API_BASE = 'https://localhost:7156/api'; // Update this to your backend URL

    // Navigation
    document.addEventListener('DOMContentLoaded', function () {
            const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const ctaButton = document.querySelector('.cta-button');

    function showSection(sectionName) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
    document.getElementById(sectionName).classList.add('active');

                navLinks.forEach(link => {
        link.classList.remove('active');
                });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
            }

            navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
            });

    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const section = ctaButton.getAttribute('data-section');
            showSection(section);
        });
            }

    // Load dynamic content
    loadProjects();
    loadAchievements();
        });

    // Projects Management
    async function loadProjects() {
            try {
                const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) {
        console.log('Backend not available, using dummy data');
    displayDummyProjects();
    return;
                }
    const projects = await response.json();
    displayProjects(projects);
            } catch (error) {
        console.log('Backend not available, using dummy data');
    displayDummyProjects();
            }
        }

    function displayDummyProjects() {
            const dummyProjects = [
    {
        id: 1,
    title: "E-Commerce Website",
    description: "A full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
    technologies: "React, Node.js, MongoDB, Stripe API",
    imageUrl: "https://via.placeholder.com/400x250?text=E-Commerce+Project",
    demoUrl: "https://demo-ecommerce.com",
    githubUrl: "https://github.com/user/ecommerce-project"
                },
    {
        id: 2,
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    technologies: "Vue.js, ASP.NET Core, SignalR, SQL Server",
    imageUrl: "https://via.placeholder.com/400x250?text=Task+Manager",
    demoUrl: "https://demo-taskmanager.com",
    githubUrl: "https://github.com/user/task-manager"
                },
    {
        id: 3,
    title: "Weather Dashboard",
    description: "A responsive weather dashboard that displays current weather, forecasts, and historical data with interactive charts and maps.",
    technologies: "JavaScript, Chart.js, OpenWeather API, Bootstrap",
    imageUrl: "https://via.placeholder.com/400x250?text=Weather+Dashboard",
    demoUrl: "https://demo-weather.com",
    githubUrl: "https://github.com/user/weather-dashboard"
                }
    ];
    displayProjects(dummyProjects);
        }

    function displayProjects(projects) {
            const container = document.getElementById('projects-container');
    container.innerHTML = '';

            projects.forEach(project => {
                const projectCard = document.createElement('div');
    projectCard.className = 'project-card';

                const techTags = project.technologies.split(',').map(tech =>
    `<span class="tech-tag">${tech.trim()}</span>`
    ).join('');

    projectCard.innerHTML = `
    <img src="${project.imageUrl || 'https://via.placeholder.com/400x250?text=Project'}"
        alt="${project.title}" class="project-image">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                <div class="tech-tags">${techTags}</div>
            </div>
            <div class="project-links">
                ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="project-link">
                                    <i class="fas fa-external-link-alt"></i> Live Demo
                                </a>` : ''}
                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link">
                                    <i class="fab fa-github"></i> GitHub
                                </a>` : ''}
            </div>
        </div>
        `;
        container.appendChild(projectCard);
            });
        }

        // Achievements Management
        async function loadAchievements() {
            try {
                const response = await fetch(`${API_BASE}/achievements`);
        if (!response.ok) {
            console.log('Backend not available, using dummy data');
        displayDummyAchievements();
        return;
                }
        const achievements = await response.json();
        displayAchievements(achievements);
            } catch (error) {
            console.log('Backend not available, using dummy data');
        displayDummyAchievements();
            }
        }

        function displayDummyAchievements() {
            const dummyAchievements = [
        {
            id: 1,
        title: "Microsoft Certified: Azure Developer Associate",
        description: "Demonstrated expertise in developing and deploying applications on Microsoft Azure platform.",
        organization: "Microsoft",
        date: "2024-06-15T00:00:00",
        certificateUrl: "https://certificates.microsoft.com/sample"
                },
        {
            id: 2,
        title: "Winner - Local Hackathon 2024",
        description: "First place winner in the annual city hackathon for developing an innovative healthcare management solution.",
        organization: "TechCity",
        date: "2024-03-20T00:00:00",
        certificateUrl: "https://techcity.com/hackathon-winners"
                },
        {
            id: 3,
        title: "AWS Certified Solutions Architect",
        description: "Validated technical expertise in designing distributed applications and systems on AWS.",
        organization: "Amazon Web Services",
        date: "2023-11-08T00:00:00",
        certificateUrl: "https://aws.amazon.com/certification/sample"
                },
        {
            id: 4,
        title: "Dean's List Recognition",
        description: "Achieved Dean's List recognition for academic excellence with GPA above 3.8.",
        organization: "University of Technology",
        date: "2023-05-30T00:00:00"
                }
        ];
        displayAchievements(dummyAchievements);
        }

        function displayAchievements(achievements) {
            const container = document.getElementById('achievements-container');
        container.innerHTML = '';

            achievements.forEach(achievement => {
                const achievementCard = document.createElement('div');
        achievementCard.className = 'achievement-card';

        const date = new Date(achievement.date).toLocaleDateString('en-US', {
            year: 'numeric',
        month: 'long',
        day: 'numeric'
                });

        achievementCard.innerHTML = `
        <h3 class="achievement-title">${achievement.title}</h3>
        <div class="achievement-org">${achievement.organization}</div>
        <div class="achievement-date">${date}</div>
        <p class="achievement-description">${achievement.description}</p>
        ${achievement.certificateUrl ? `<a href="${achievement.certificateUrl}" target="_blank" class="project-link">
                            <i class="fas fa-certificate"></i> View Certificate
                        </a>` : ''}
        `;
        container.appendChild(achievementCard);
            });
        }

        // Admin Panel Functions
        function toggleAdminForm(type) {
            const form = document.getElementById(`${type}-admin-form`);
        form.classList.toggle('active');
        }

        // Project Form Submission
        document.getElementById('project-form').addEventListener('submit', async function (e) {
            e.preventDefault();

        const projectData = {
            title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        technologies: document.getElementById('project-technologies').value,
        imageUrl: document.getElementById('project-image').value || null,
        demoUrl: document.getElementById('project-demo').value || null,
        githubUrl: document.getElementById('project-github').value || null
            };

        try {
                const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                    },
        body: JSON.stringify(projectData)
                });

        if (response.ok) {
            document.getElementById('project-form').reset();
        toggleAdminForm('project');
        loadProjects();
        alert('Project added successfully!');
                } else {
            alert('Error adding project. Please check if the backend is running.');
                }
            } catch (error) {
            alert('Error connecting to backend. Please ensure the ASP.NET server is running.');
            }
        });

        // Achievement Form Submission
        document.getElementById('achievement-form').addEventListener('submit', async function (e) {
            e.preventDefault();

        const achievementData = {
            title: document.getElementById('achievement-title').value,
        description: document.getElementById('achievement-description').value,
        organization: document.getElementById('achievement-organization').value,
        date: document.getElementById('achievement-date').value,
        certificateUrl: document.getElementById('achievement-certificate').value || null
            };

        try {
                const response = await fetch(`${API_BASE}/achievements`, {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                    },
        body: JSON.stringify(achievementData)
                });

        if (response.ok) {
            document.getElementById('achievement-form').reset();
        toggleAdminForm('achievement');
        loadAchievements();
        alert('Achievement added successfully!');
                } else {
            alert('Error adding achievement. Please check if the backend is running.');
                }
            } catch (error) {
            alert('Error connecting to backend. Please ensure the ASP.NET server is running.');
            }
        });

        // Contact Form Submission
        document.getElementById('contact-form').addEventListener('submit', async function (e) {
            e.preventDefault();

        const submitBtn = document.querySelector('.submit-btn');
        const loading = document.getElementById('contact-loading');
        const success = document.getElementById('contact-success');
        const error = document.getElementById('contact-error');

        // Hide previous messages
        success.style.display = 'none';
        error.style.display = 'none';

        // Show loading
        loading.style.display = 'block';
        submitBtn.disabled = true;

        const contactData = {
            name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
            };

        try {
                const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                    },
        body: JSON.stringify(contactData)
                });

        loading.style.display = 'none';
        submitBtn.disabled = false;

        if (response.ok) {
            document.getElementById('contact-form').reset();
        success.style.display = 'block';
                } else {
            error.style.display = 'block';
                }
            } catch (error) {
            loading.style.display = 'none';
        submitBtn.disabled = false;
        error.style.display = 'block';
            }
        });

        // Smooth scrolling for navigation
        function smoothScrollTo(elementId) {
            document.getElementById(elementId).scrollIntoView({
                behavior: 'smooth'
            });
        }