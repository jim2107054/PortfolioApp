#!/bin/bash

# Portfolio Setup Script
# This script helps you set up the portfolio application quickly

echo "?? Setting up Portfolio Application..."
echo "======================================"

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "? .NET SDK is not installed. Please install .NET 8 SDK first."
    echo "   Download from: https://dotnet.microsoft.com/download"
    exit 1
fi

echo "? .NET SDK found"

# Check .NET version
DOTNET_VERSION=$(dotnet --version)
echo "?? .NET Version: $DOTNET_VERSION"

# Navigate to project directory
cd "$(dirname "$0")"
PROJECT_DIR="PortfolioJim"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "? Project directory '$PROJECT_DIR' not found!"
    exit 1
fi

cd "$PROJECT_DIR"

echo "?? Working directory: $(pwd)"

# Restore NuGet packages
echo "?? Restoring NuGet packages..."
dotnet restore

if [ $? -eq 0 ]; then
    echo "? Packages restored successfully"
else
    echo "? Failed to restore packages"
    exit 1
fi

# Build the project
echo "?? Building the project..."
dotnet build

if [ $? -eq 0 ]; then
    echo "? Build successful"
else
    echo "? Build failed"
    exit 1
fi

# Display setup information
echo ""
echo "?? Setup Complete!"
echo "=================="
echo ""
echo "?? Next Steps:"
echo "1. Run the application:"
echo "   dotnet run"
echo ""
echo "2. Open your browser and navigate to:"
echo "   - Portfolio: http://localhost:5000"
echo "   - Admin Dashboard: http://localhost:5000/admin.html"
echo ""
echo "?? Admin Credentials:"
echo "   Email: admin@portfolio.com"
echo "   Password: admin123"
echo ""
echo "?? Quick Access:"
echo "   - Press Ctrl+Shift+A to open admin login"
echo "   - Add ?admin=true to any URL for admin access"
echo ""
echo "?? For detailed documentation, see:"
echo "   - PORTFOLIO_DATABASE_INTEGRATION.md"
echo "   - README.md"
echo ""

# Ask if user wants to run the application
read -p "?? Would you like to start the application now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "?? Starting the application..."
    echo "Press Ctrl+C to stop the application"
    echo ""
    dotnet run
fi

echo "? Setup script completed!"