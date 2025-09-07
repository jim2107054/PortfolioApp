# Portfolio Website - MD. Jahid Hasan Jim

A modern, responsive, and feature-rich portfolio website built with HTML5, CSS3, JavaScript, and .NET 8. This portfolio showcases skills, projects, achievements, and provides a seamless user experience across all devices.

## ?? Features

### Frontend Features
- **Modern Design**: Clean, professional design with smooth animations
- **Responsive Layout**: Works perfectly on all devices (mobile, tablet, desktop)
- **Progressive Web App (PWA)**: Installable, offline-capable, and app-like experience
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Interactive Animations**: Scroll-triggered animations, typing effects, particle system
- **Lazy Loading**: Optimized image loading for better performance
- **Smooth Scrolling**: Enhanced navigation with smooth scrolling effects
- **Contact Form**: Functional contact form with validation and toast notifications
- **Skills Visualization**: Animated skill bars with proficiency indicators
- **Project Showcase**: Interactive project gallery with filtering
- **Achievement Timeline**: Visual timeline for certifications and awards
- **Social Media Integration**: Quick access to professional profiles

### Technical Features
- **Service Worker**: Offline functionality and caching strategies
- **Performance Optimized**: Minified assets, optimized images, efficient loading
- **SEO Optimized**: Meta tags, structured data, semantic HTML
- **Accessibility**: WCAG compliant, keyboard navigation, screen reader friendly
- **Cross-browser Compatible**: Works on all modern browsers
- **Mobile-first Design**: Optimized for mobile devices with progressive enhancement

### Backend Integration
- **Database Integration**: Dynamic content loading from database
- **API Endpoints**: RESTful API for data management
- **Admin Panel**: Secure admin interface for content management
- **Real-time Updates**: Dynamic content updates without page refresh

## ??? Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with Flexbox, Grid, Custom Properties
- **JavaScript (ES6+)**: Modern JavaScript with classes, async/await
- **Font Awesome**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography
- **Progressive Web App**: Service Worker, Web App Manifest

### Backend
- **.NET 8**: Latest version of .NET for backend services
- **Entity Framework Core**: ORM for database operations
- **SQL Server**: Database for storing portfolio data
- **RESTful APIs**: Clean API design for frontend communication

## ?? Project Structure

```
PortfolioJim/
??? wwwroot/
?   ??? css/
?   ?   ??? style.css          # Main stylesheet
?   ?   ??? components.css     # Component-specific styles
?   ??? js/
?   ?   ??? jim.js            # Main JavaScript functionality
?   ?   ??? portfolio.js      # Portfolio-specific features
?   ?   ??? admin.js          # Admin panel functionality
?   ?   ??? admin-dashboard.js # Dashboard features
?   ??? images/
?   ?   ??? portfolio.jpg     # Profile images
?   ?   ??? projects/         # Project screenshots
?   ??? index.html            # Main portfolio page
?   ??? admin.html            # Admin dashboard page
?   ??? manifest.json         # PWA manifest
?   ??? sw.js                 # Service worker
??? Models/                   # Data models
??? Controllers/              # API controllers
??? Data/                     # Database context
??? Program.cs               # Application entry point
??? PortfolioJim.csproj      # Project file
```

## ?? Design System

### Color Palette
- **Primary**: #2563eb (Blue)
- **Secondary**: #8b5cf6 (Purple)
- **Text Primary**: #1e293b (Dark Gray)
- **Text Secondary**: #475569 (Medium Gray)
- **Background**: #ffffff (White)
- **Accent**: #f1f5f9 (Light Gray)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 700-800 weight
- **Body Text**: 400-500 weight
- **Responsive Sizing**: clamp() for fluid typography

## ?? Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1200px+

## ? Performance Optimizations

### Loading Performance
- **Critical CSS**: Inline critical styles
- **Font Display**: Swap for faster text rendering
- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Images loaded on demand
- **Resource Preloading**: Critical resources preloaded

### Runtime Performance
- **Efficient JavaScript**: Optimized algorithms and DOM operations
- **CSS Animations**: Hardware-accelerated animations
- **Debounced Events**: Optimized scroll and resize handlers
- **Memory Management**: Proper cleanup of event listeners

## ?? Setup and Installation

### Prerequisites
- .NET 8 SDK
- SQL Server (LocalDB or full version)
- Visual Studio 2022 or VS Code
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jim2107054/PortfolioApp.git
   cd PortfolioApp
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update database connection string**
   - Edit `appsettings.json`
   - Update `ConnectionStrings:DefaultConnection`

4. **Apply database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access the portfolio**
   - Portfolio: `https://localhost:5001`
   - Admin Panel: `https://localhost:5001/admin.html`

## ?? Contact

**MD. Jahid Hasan Jim**
- **Email**: jahid.hasan.jim@gmail.com
- **LinkedIn**: [md-jahid-hasan-jim](https://www.linkedin.com/in/md-jahid-hasan-jim/)
- **GitHub**: [jim2107054](https://github.com/jim2107054)
- **WhatsApp**: +880 1581 705456

---

*Built with ?? by MD. Jahid Hasan Jim*
