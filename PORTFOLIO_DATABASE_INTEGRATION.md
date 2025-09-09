# Portfolio with Admin Dashboard - Complete Database Integration

## Overview

This is a professional portfolio website with a comprehensive admin dashboard that stores data in a database using Entity Framework Core. The application features both frontend portfolio display and backend admin management with real-time data synchronization.

## Architecture

### Backend (.NET 8)
- **Entity Framework Core** with In-Memory Database (easily switchable to SQL Server)
- **RESTful API Controllers** for all CRUD operations
- **Comprehensive Models** for all portfolio sections
- **Auto-seeding** with realistic sample data
- **CORS Support** for frontend integration

### Frontend
- **Portfolio Website** (`index.html`) - Public-facing portfolio
- **Admin Dashboard** (`admin.html`) - Content management system
- **Real-time synchronization** between portfolio and admin
- **Offline support** with localStorage fallback
- **Progressive Web App** capabilities

### Database Models

```csharp
// Profile Information
public class Profile
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string AboutContent { get; set; }
    public string ProfileImageUrl { get; set; }
    public string Email { get; set; }
    public string LinkedInUrl { get; set; }
    public string GitHubUrl { get; set; }
    public string FacebookUrl { get; set; }
    public string WhatsAppNumber { get; set; }
    public DateTime UpdatedDate { get; set; }
}

// Projects Portfolio
public class Project
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Technologies { get; set; }
    public string ImageUrl { get; set; }
    public string DemoUrl { get; set; }
    public string GithubUrl { get; set; }
    public string Status { get; set; } // Completed, In Progress, Planning
    public string Category { get; set; } // Web Development, Mobile App, etc.
    public DateTime CreatedDate { get; set; }
}

// Skills & Expertise
public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Category { get; set; } // Frontend, Backend, Database, etc.
    public string Level { get; set; } // Beginner, Intermediate, Advanced, Expert
    public string IconClass { get; set; } // Font Awesome icon class
    public int ProficiencyPercentage { get; set; }
    public int YearsOfExperience { get; set; }
}

// Educational Background
public class Education
{
    public int Id { get; set; }
    public string Degree { get; set; }
    public string School { get; set; }
    public string Duration { get; set; }
    public string Location { get; set; }
    public string GPA { get; set; }
    public string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

// Achievements & Certifications
public class Achievement
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Organization { get; set; }
    public DateTime Date { get; set; }
    public string CertificateUrl { get; set; }
    public string Type { get; set; } // Certification, Award, Competition, etc.
    public string Level { get; set; } // Professional, National, International, etc.
}

// Contact Messages
public class Contact
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Subject { get; set; }
    public string Message { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsRead { get; set; }
}
```

## API Endpoints

### Profile Management
- `GET /api/profile` - Get profile information
- `PUT /api/profile` - Update profile information

### Skills Management
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Add new skill
- `PUT /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill

### Projects Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get specific project
- `POST /api/projects` - Add new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Education Management
- `GET /api/education` - Get education history
- `POST /api/education` - Add education entry
- `PUT /api/education/{id}` - Update education entry
- `DELETE /api/education/{id}` - Delete education entry

### Achievements Management
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Add new achievement
- `PUT /api/achievements/{id}` - Update achievement
- `DELETE /api/achievements/{id}` - Delete achievement

### Contact Management
- `GET /api/contact` - Get all contact messages
- `POST /api/contact` - Submit contact message
- `PUT /api/contact/{id}` - Update contact message (mark as read)
- `DELETE /api/contact/{id}` - Delete contact message

## Running the Application

### Prerequisites
- .NET 8 SDK
- A modern web browser
- Optional: SQL Server (for persistent database)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PortfolioJim
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Run the application**
   ```bash
   dotnet run
   ```

4. **Access the application**
   - Portfolio: `http://localhost:5000` or `https://localhost:5001`
   - Admin Dashboard: `http://localhost:5000/admin.html`

### Admin Access

**Default Admin Credentials:**
- **Email:** `admin@portfolio.com`
- **Password:** `admin123`

**Quick Access Methods:**
- Click the "Admin" button in the navigation (visible on localhost)
- Use keyboard shortcut: `Ctrl/Cmd + Shift + A`
- Add `?admin=true` to the URL
- Use `Alt + A` for quick access

## Database Configuration

### Current Setup (In-Memory Database)
The application uses Entity Framework with an in-memory database for easy development and testing:

```csharp
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseInMemoryDatabase("PortfolioDb"));
```

### Switching to SQL Server

To use SQL Server for persistent data storage:

1. **Update Program.cs:**
   ```csharp
   builder.Services.AddDbContext<PortfolioContext>(options =>
       options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
   ```

2. **Add connection string to appsettings.json:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PortfolioDb;Trusted_Connection=true;"
     }
   }
   ```

3. **Create and run migrations:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

## Admin Dashboard Features

### Dashboard Overview
- **Statistics Cards** - Projects, achievements, skills, and message counts
- **Recent Activity** - Timeline of recent additions and updates
- **Quick Actions** - Fast access to common tasks

### Profile Management
- **Personal Information** - Name, title, description, contact details
- **About Section** - Rich text content for the about page
- **Social Media Links** - LinkedIn, GitHub, Facebook, WhatsApp
- **Profile Image** - Upload and manage profile pictures

### Content Management
- **Projects Portfolio** - Add, edit, delete projects with images, demos, and code links
- **Skills & Technologies** - Manage technical skills with proficiency levels
- **Education History** - Academic background and qualifications
- **Achievements** - Certifications, awards, and accomplishments

### Communication
- **Contact Messages** - View and manage incoming contact form submissions
- **Email Integration** - Direct reply to messages from the dashboard
- **Message Status** - Mark messages as read/unread

### Settings & Security
- **General Settings** - Site configuration and preferences
- **Security Settings** - Admin credentials and session management
- **Data Management** - Export/import data, backup and restore

## Real-time Synchronization

The portfolio and admin dashboard are synchronized in real-time:

### Portfolio ? Admin
- Contact form submissions appear instantly in admin dashboard
- User interactions and analytics are tracked

### Admin ? Portfolio
- Content updates reflect immediately on the portfolio
- No need to refresh the portfolio page
- Automatic cache invalidation

### Offline Support
- **Local Storage Caching** - Portfolio works offline
- **Draft Saving** - Admin changes saved as drafts
- **Sync on Reconnect** - Changes sync when connection restored

## Security Features

### Authentication
- **Session Management** - 24-hour session timeout
- **Activity Tracking** - Login/logout events logged
- **Failed Attempt Protection** - Basic brute force protection

### Authorization
- **Role-based Access** - Admin vs regular user permissions
- **Secure API Endpoints** - Protected admin routes
- **Session Validation** - Server-side session verification

### Data Protection
- **Input Validation** - All forms validate user input
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Form tokens and validation

## Advanced Features

### Progressive Web App (PWA)
- **Service Worker** - Offline functionality
- **App Manifest** - Install as mobile/desktop app
- **Push Notifications** - Admin alerts (future feature)

### Performance Optimization
- **Lazy Loading** - Images and content loaded on demand
- **Data Caching** - Smart caching strategies
- **Code Splitting** - Modular JavaScript architecture

### SEO & Accessibility
- **Meta Tags** - Comprehensive SEO optimization
- **Schema Markup** - Structured data for search engines
- **ARIA Labels** - Full accessibility support
- **Semantic HTML** - Proper document structure

## Development Tools

### Frontend
- **Modern JavaScript** - ES6+ features, modular architecture
- **CSS Grid/Flexbox** - Responsive layout system
- **Font Awesome** - Icon library
- **Google Fonts** - Typography

### Backend
- **ASP.NET Core 8** - Latest .NET framework
- **Entity Framework Core** - ORM for database operations
- **Auto-mapper** - Object mapping
- **Swagger** - API documentation (add if needed)

### Development Workflow
- **Hot Reload** - Automatic browser refresh during development
- **Error Handling** - Comprehensive error logging
- **Debug Mode** - Enhanced debugging features
- **Build Optimization** - Production-ready builds

## Deployment Options

### Local Development
```bash
dotnet run --environment Development
```

### Production Deployment
1. **Build for production:**
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. **Deploy to:**
   - **Azure App Service** - Easy cloud deployment
   - **IIS** - Windows server hosting
   - **Docker** - Containerized deployment
   - **Linux Server** - Cross-platform hosting

### Database Deployment
- **Azure SQL Database** - Cloud database
- **SQL Server** - On-premises database
- **PostgreSQL** - Alternative database option
- **SQLite** - File-based database for small deployments

## Customization Guide

### Branding
1. Update colors in `css/style.css`
2. Replace logo and images in `wwwroot/images/`
3. Modify site title and descriptions
4. Update social media links

### Content
1. Access admin dashboard
2. Update profile information
3. Add your projects, skills, and achievements
4. Customize the about section
5. Set up contact information

### Advanced Customization
1. Modify models in `Program.cs` for additional fields
2. Update controllers for new API endpoints
3. Enhance frontend JavaScript for new features
4. Add custom CSS for styling changes

## Support & Maintenance

### Monitoring
- **Application Logs** - Check console for errors
- **Database Health** - Monitor connection status
- **Performance Metrics** - Track load times

### Backup Strategy
- **Database Backup** - Regular automated backups
- **Content Export** - Admin dashboard export feature
- **Code Repository** - Version control with Git

### Updates
- **Framework Updates** - Keep .NET Core updated
- **Security Patches** - Apply security updates promptly
- **Feature Enhancements** - Regular feature additions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or questions about this portfolio system:
- **Email:** jahid.hasan.jim@gmail.com
- **GitHub:** https://github.com/jim2107054
- **LinkedIn:** https://www.linkedin.com/in/md-jahid-hasan-jim/

---

*This portfolio system demonstrates modern web development practices with .NET 8, Entity Framework Core, and responsive frontend design. It's production-ready and can be easily customized for any professional portfolio needs.*