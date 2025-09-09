@echo off
REM Portfolio Setup Script for Windows
REM This script helps you set up the portfolio application quickly

echo ?? Setting up Portfolio Application...
echo ======================================

REM Check if .NET is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ? .NET SDK is not installed. Please install .NET 8 SDK first.
    echo    Download from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo ? .NET SDK found

REM Check .NET version
for /f "tokens=*" %%a in ('dotnet --version') do set DOTNET_VERSION=%%a
echo ?? .NET Version: %DOTNET_VERSION%

REM Navigate to project directory
cd /d "%~dp0"
set PROJECT_DIR=PortfolioJim

if not exist "%PROJECT_DIR%" (
    echo ? Project directory '%PROJECT_DIR%' not found!
    pause
    exit /b 1
)

cd "%PROJECT_DIR%"

echo ?? Working directory: %cd%

REM Restore NuGet packages
echo ?? Restoring NuGet packages...
dotnet restore

if %errorlevel% neq 0 (
    echo ? Failed to restore packages
    pause
    exit /b 1
)

echo ? Packages restored successfully

REM Build the project
echo ?? Building the project...
dotnet build

if %errorlevel% neq 0 (
    echo ? Build failed
    pause
    exit /b 1
)

echo ? Build successful

REM Display setup information
echo.
echo ?? Setup Complete!
echo ==================
echo.
echo ?? Next Steps:
echo 1. Run the application:
echo    dotnet run
echo.
echo 2. Open your browser and navigate to:
echo    - Portfolio: http://localhost:5000
echo    - Admin Dashboard: http://localhost:5000/admin.html
echo.
echo ?? Admin Credentials:
echo    Email: admin@portfolio.com
echo    Password: admin123
echo.
echo ?? Quick Access:
echo    - Press Ctrl+Shift+A to open admin login
echo    - Add ?admin=true to any URL for admin access
echo.
echo ?? For detailed documentation, see:
echo    - PORTFOLIO_DATABASE_INTEGRATION.md
echo    - README.md
echo.

REM Ask if user wants to run the application
set /p START_APP="?? Would you like to start the application now? (y/N): "
if /i "%START_APP%"=="y" (
    echo ?? Starting the application...
    echo Press Ctrl+C to stop the application
    echo.
    dotnet run
)

echo ? Setup script completed!
pause