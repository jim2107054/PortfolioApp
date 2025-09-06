using Microsoft.EntityFrameworkCore;
using PortfolioApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Use in-memory database for easier development
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseInMemoryDatabase("PortfolioDb"));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "file://")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowFrontend");

// Add default route to serve index.html
app.MapGet("/", () => Results.Redirect("/index.html"));

app.MapControllers();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PortfolioContext>();
    context.Database.EnsureCreated();
    SeedData.Initialize(context);
}

app.Run();

// Models
namespace PortfolioApp.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Technologies { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DemoUrl { get; set; }
        public string? GithubUrl { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Completed";
        public string Category { get; set; } = "Web Development";
    }

    public class Achievement
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? CertificateUrl { get; set; }
        public string Type { get; set; } = "Certification";
        public string Level { get; set; } = "Professional";
    }

    public class Contact
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;
    }

    public class Profile
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? WhatsAppNumber { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? AboutContent { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }

    public class Skill
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string? IconClass { get; set; }
        public int ProficiencyPercentage { get; set; } = 75;
        public int YearsOfExperience { get; set; } = 1;
    }

    public class Education
    {
        public int Id { get; set; }
        public string Degree { get; set; } = string.Empty;
        public string School { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string? GPA { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}

// Data Context
namespace PortfolioApp.Data
{
    using PortfolioApp.Models;

    public class PortfolioContext : DbContext
    {
        public PortfolioContext(DbContextOptions<PortfolioContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Education> Education { get; set; }
    }

    public static class SeedData
    {
        public static void Initialize(PortfolioContext context)
        {
            if (context.Projects.Any())
                return; // DB has been seeded

            // Seed Profile
            context.Profiles.Add(new Profile
            {
                FullName = "MD. Jahid Hasan Jim",
                Title = "Full Stack Developer & Software Engineer",
                Description = "Passionate about creating innovative web solutions and scalable applications. I transform ideas into digital reality with clean code and modern technologies.",
                Email = "jahid.hasan.jim@gmail.com",
                LinkedInUrl = "https://www.linkedin.com/in/md-jahid-hasan-jim/",
                GitHubUrl = "https://github.com/jim2107054",
                FacebookUrl = "https://facebook.com/jahid.hasan.jim",
                WhatsAppNumber = "+8801581705456",
                AboutContent = "Hello! I'm MD. Jahid Hasan Jim, a passionate full-stack developer with over 3 years of experience creating digital solutions that make a difference. I specialize in modern web technologies and love turning complex problems into simple, beautiful designs. My journey in software development started during my computer science studies, where I discovered my passion for creating user-centric applications."
            });

            // Seed Skills
            context.Skills.AddRange(
                new Skill { Name = "JavaScript", Category = "Frontend", Level = "Advanced", IconClass = "fab fa-js-square", ProficiencyPercentage = 90, YearsOfExperience = 4 },
                new Skill { Name = "React", Category = "Frontend", Level = "Advanced", IconClass = "fab fa-react", ProficiencyPercentage = 85, YearsOfExperience = 3 },
                new Skill { Name = "Node.js", Category = "Backend", Level = "Intermediate", IconClass = "fab fa-node-js", ProficiencyPercentage = 80, YearsOfExperience = 3 },
                new Skill { Name = "C#", Category = "Languages", Level = "Advanced", IconClass = "fas fa-code", ProficiencyPercentage = 88, YearsOfExperience = 4 },
                new Skill { Name = "ASP.NET Core", Category = "Backend", Level = "Advanced", IconClass = "fas fa-server", ProficiencyPercentage = 85, YearsOfExperience = 3 },
                new Skill { Name = "SQL Server", Category = "Database", Level = "Intermediate", IconClass = "fas fa-database", ProficiencyPercentage = 75, YearsOfExperience = 3 },
                new Skill { Name = "Azure", Category = "DevOps", Level = "Intermediate", IconClass = "fab fa-microsoft", ProficiencyPercentage = 70, YearsOfExperience = 2 },
                new Skill { Name = "Git", Category = "Tools", Level = "Advanced", IconClass = "fab fa-git-alt", ProficiencyPercentage = 90, YearsOfExperience = 4 },
                new Skill { Name = "Python", Category = "Languages", Level = "Intermediate", IconClass = "fab fa-python", ProficiencyPercentage = 75, YearsOfExperience = 2 },
                new Skill { Name = "Docker", Category = "DevOps", Level = "Beginner", IconClass = "fab fa-docker", ProficiencyPercentage = 60, YearsOfExperience = 1 }
            );

            // Seed Education
            context.Education.AddRange(
                new Education
                {
                    Degree = "Bachelor of Science in Computer Science",
                    School = "University of Technology",
                    Duration = "2019 - 2023",
                    GPA = "3.8/4.0",
                    Location = "Dhaka, Bangladesh",
                    Description = "Specialized in software engineering and web development. Completed capstone project on e-commerce platform development.",
                    StartDate = new DateTime(2019, 1, 1),
                    EndDate = new DateTime(2023, 12, 31)
                },
                new Education
                {
                    Degree = "Higher Secondary Certificate (Science)",
                    School = "Government Science College",
                    Duration = "2017 - 2019",
                    GPA = "5.00/5.00",
                    Location = "Dhaka, Bangladesh",
                    Description = "Focused on Mathematics, Physics, and Chemistry with excellent academic performance.",
                    StartDate = new DateTime(2017, 7, 1),
                    EndDate = new DateTime(2019, 6, 30)
                }
            );

            // Seed Projects
            context.Projects.AddRange(
                new Project
                {
                    Title = "E-Commerce Website",
                    Description = "A full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration using Stripe API.",
                    Technologies = "React, Node.js, MongoDB, Stripe API, JWT",
                    ImageUrl = "https://via.placeholder.com/400x250?text=E-Commerce+Project",
                    DemoUrl = "https://demo-ecommerce.com",
                    GithubUrl = "https://github.com/jim2107054/ecommerce-project",
                    Status = "Completed",
                    Category = "Web Development"
                },
                new Project
                {
                    Title = "Task Management App",
                    Description = "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
                    Technologies = "Vue.js, ASP.NET Core, SignalR, SQL Server",
                    ImageUrl = "https://via.placeholder.com/400x250?text=Task+Manager",
                    DemoUrl = "https://demo-taskmanager.com",
                    GithubUrl = "https://github.com/jim2107054/task-manager",
                    Status = "Completed",
                    Category = "Web Development"
                },
                new Project
                {
                    Title = "Weather Dashboard",
                    Description = "A responsive weather dashboard that displays current weather, forecasts, and historical data with interactive charts and maps.",
                    Technologies = "JavaScript, Chart.js, OpenWeather API, Bootstrap",
                    ImageUrl = "https://via.placeholder.com/400x250?text=Weather+Dashboard",
                    DemoUrl = "https://demo-weather.com",
                    GithubUrl = "https://github.com/jim2107054/weather-dashboard",
                    Status = "Completed",
                    Category = "Web Development"
                },
                new Project
                {
                    Title = "Portfolio Website",
                    Description = "A modern, responsive portfolio website built with ASP.NET Core and vanilla JavaScript, featuring an admin panel for content management.",
                    Technologies = "ASP.NET Core, JavaScript, HTML5, CSS3, Entity Framework",
                    ImageUrl = "https://via.placeholder.com/400x250?text=Portfolio+Website",
                    DemoUrl = "https://jahidhasanjim.com",
                    GithubUrl = "https://github.com/jim2107054/PortfolioApp",
                    Status = "In Progress",
                    Category = "Web Development"
                }
            );

            // Seed Achievements
            context.Achievements.AddRange(
                new Achievement
                {
                    Title = "Microsoft Certified: Azure Developer Associate",
                    Description = "Demonstrated expertise in developing and deploying applications on Microsoft Azure platform.",
                    Organization = "Microsoft",
                    Date = new DateTime(2024, 6, 15),
                    CertificateUrl = "https://certificates.microsoft.com/sample",
                    Type = "Certification",
                    Level = "Professional"
                },
                new Achievement
                {
                    Title = "Winner - Local Hackathon 2024",
                    Description = "First place winner in the annual city hackathon for developing an innovative healthcare management solution.",
                    Organization = "TechCity",
                    Date = new DateTime(2024, 3, 20),
                    CertificateUrl = "https://techcity.com/hackathon-winners",
                    Type = "Competition",
                    Level = "Local"
                },
                new Achievement
                {
                    Title = "AWS Certified Solutions Architect",
                    Description = "Validated technical expertise in designing distributed applications and systems on AWS.",
                    Organization = "Amazon Web Services",
                    Date = new DateTime(2023, 11, 8),
                    CertificateUrl = "https://aws.amazon.com/certification/sample",
                    Type = "Certification",
                    Level = "Professional"
                },
                new Achievement
                {
                    Title = "Dean's List Recognition",
                    Description = "Achieved Dean's List recognition for academic excellence with GPA above 3.8.",
                    Organization = "University of Technology",
                    Date = new DateTime(2023, 5, 30),
                    Type = "Award",
                    Level = "Institutional"
                },
                new Achievement
                {
                    Title = "Google Developer Student Club Lead",
                    Description = "Led a community of 200+ student developers, organizing workshops and hackathons.",
                    Organization = "Google for Developers",
                    Date = new DateTime(2022, 8, 1),
                    Type = "Leadership",
                    Level = "Regional"
                }
            );

            // Seed some sample contact messages
            context.Contacts.AddRange(
                new Contact
                {
                    Name = "John Smith",
                    Email = "john.smith@email.com",
                    Subject = "Web Development Project",
                    Message = "Hi Jahid, I'm interested in hiring you for a web development project. Could we schedule a call to discuss the requirements?",
                    CreatedDate = DateTime.Now.AddDays(-2),
                    IsRead = false
                },
                new Contact
                {
                    Name = "Sarah Johnson",
                    Email = "sarah.j@company.com",
                    Subject = "Collaboration Opportunity",
                    Message = "Hello! I saw your portfolio and I'm impressed with your work. We have an exciting collaboration opportunity that might interest you.",
                    CreatedDate = DateTime.Now.AddDays(-5),
                    IsRead = true
                }
            );

            context.SaveChanges();
        }
    }
}

// Controllers
namespace PortfolioApp.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using PortfolioApp.Data;
    using PortfolioApp.Models;

    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public ProjectsController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects.OrderByDescending(p => p.CreatedDate).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();
            return project;
        }

        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
                return BadRequest();

            _context.Entry(project).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AchievementsController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public AchievementsController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Achievement>>> GetAchievements()
        {
            return await _context.Achievements.OrderByDescending(a => a.Date).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Achievement>> GetAchievement(int id)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
                return NotFound();
            return achievement;
        }

        [HttpPost]
        public async Task<ActionResult<Achievement>> PostAchievement(Achievement achievement)
        {
            _context.Achievements.Add(achievement);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAchievement), new { id = achievement.Id }, achievement);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAchievement(int id, Achievement achievement)
        {
            if (id != achievement.Id)
                return BadRequest();

            _context.Entry(achievement).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAchievement(int id)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
                return NotFound();

            _context.Achievements.Remove(achievement);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public ContactController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Contact>> PostContact(Contact contact)
        {
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetContact", new { id = contact.Id }, contact);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            return await _context.Contacts.OrderByDescending(c => c.CreatedDate).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contact>> GetContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
                return NotFound();
            return contact;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutContact(int id, Contact contact)
        {
            if (id != contact.Id)
                return BadRequest();

            _context.Entry(contact).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
                return NotFound();

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public ProfileController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Profile>> GetProfile()
        {
            var profile = await _context.Profiles.FirstOrDefaultAsync();
            if (profile == null)
                return NotFound();
            return profile;
        }

        [HttpPut]
        public async Task<IActionResult> PutProfile(Profile profile)
        {
            var existingProfile = await _context.Profiles.FirstOrDefaultAsync();
            if (existingProfile == null)
            {
                _context.Profiles.Add(profile);
            }
            else
            {
                existingProfile.FullName = profile.FullName;
                existingProfile.Title = profile.Title;
                existingProfile.Description = profile.Description;
                existingProfile.ProfileImageUrl = profile.ProfileImageUrl;
                existingProfile.LinkedInUrl = profile.LinkedInUrl;
                existingProfile.GitHubUrl = profile.GitHubUrl;
                existingProfile.FacebookUrl = profile.FacebookUrl;
                existingProfile.WhatsAppNumber = profile.WhatsAppNumber;
                existingProfile.Email = profile.Email;
                existingProfile.AboutContent = profile.AboutContent;
                existingProfile.UpdatedDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public SkillsController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
        {
            return await _context.Skills.OrderBy(s => s.Category).ThenBy(s => s.Name).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Skill>> GetSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
                return NotFound();
            return skill;
        }

        [HttpPost]
        public async Task<ActionResult<Skill>> PostSkill(Skill skill)
        {
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSkill(int id, Skill skill)
        {
            if (id != skill.Id)
                return BadRequest();

            _context.Entry(skill).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
                return NotFound();

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class EducationController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public EducationController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Education>>> GetEducation()
        {
            return await _context.Education.OrderByDescending(e => e.StartDate).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Education>> GetEducation(int id)
        {
            var education = await _context.Education.FindAsync(id);
            if (education == null)
                return NotFound();
            return education;
        }

        [HttpPost]
        public async Task<ActionResult<Education>> PostEducation(Education education)
        {
            _context.Education.Add(education);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEducation), new { id = education.Id }, education);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEducation(int id, Education education)
        {
            if (id != education.Id)
                return BadRequest();

            _context.Entry(education).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEducation(int id)
        {
            var education = await _context.Education.FindAsync(id);
            if (education == null)
                return NotFound();

            _context.Education.Remove(education);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}