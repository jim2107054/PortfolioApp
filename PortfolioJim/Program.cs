using Microsoft.EntityFrameworkCore;
using PortfolioApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddDbContext<PortfolioContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseCors("AllowFrontend");
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
    }

    public class Achievement
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? CertificateUrl { get; set; }
    }

    public class Contact
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
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
    }

    public static class SeedData
    {
        public static void Initialize(PortfolioContext context)
        {
            if (context.Projects.Any())
                return; // DB has been seeded

            // Seed Projects
            context.Projects.AddRange(
                new Project
                {
                    Title = "E-Commerce Website",
                    Description = "A full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
                    Technologies = "React, Node.js, MongoDB, Stripe API",
                    ImageUrl = "https://via.placeholder.com/400x250?text=E-Commerce+Project",
                    DemoUrl = "https://demo-ecommerce.com",
                    GithubUrl = "https://github.com/user/ecommerce-project"
                },
                new Project
                {
                    Title = "Task Management App",
                    Description = "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
                    Technologies = "Vue.js, ASP.NET Core, SignalR, SQL Server",
                    ImageUrl = "https://via.placeholder.com/400x250?text=Task+Manager",
                    DemoUrl = "https://demo-taskmanager.com",
                    GithubUrl = "https://github.com/user/task-manager"
                },
                new Project
                {
                    Title = "Weather Dashboard",
                    Description = "A responsive weather dashboard that displays current weather, forecasts, and historical data with interactive charts and maps.",
                    Technologies = "JavaScript, Chart.js, OpenWeather API, Bootstrap",
                    ImageUrl = "https://via.placeholder.com/400x250?text=Weather+Dashboard",
                    DemoUrl = "https://demo-weather.com",
                    GithubUrl = "https://github.com/user/weather-dashboard"
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
                    CertificateUrl = "https://certificates.microsoft.com/sample"
                },
                new Achievement
                {
                    Title = "Winner - Local Hackathon 2024",
                    Description = "First place winner in the annual city hackathon for developing an innovative healthcare management solution.",
                    Organization = "TechCity",
                    Date = new DateTime(2024, 3, 20),
                    CertificateUrl = "https://techcity.com/hackathon-winners"
                },
                new Achievement
                {
                    Title = "AWS Certified Solutions Architect",
                    Description = "Validated technical expertise in designing distributed applications and systems on AWS.",
                    Organization = "Amazon Web Services",
                    Date = new DateTime(2023, 11, 8),
                    CertificateUrl = "https://aws.amazon.com/certification/sample"
                },
                new Achievement
                {
                    Title = "Dean's List Recognition",
                    Description = "Achieved Dean's List recognition for academic excellence with GPA above 3.8.",
                    Organization = "University of Technology",
                    Date = new DateTime(2023, 5, 30)
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
    }
}