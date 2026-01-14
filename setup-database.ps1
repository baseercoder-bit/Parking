# Database Setup Script for JamaParking
# This script helps set up the PostgreSQL database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JamaParking Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env file created" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please edit .env file and update:" -ForegroundColor Yellow
        Write-Host "   - DATABASE_URL with your PostgreSQL connection string" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET with a secure random string" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key after you've updated .env file..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "✗ .env.example not found. Creating .env file..." -ForegroundColor Red
        @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jamaparking?schema=public"
JWT_SECRET="change-this-to-a-random-secret-key-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
"@ | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "✓ .env file created with default values" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please edit .env file and update:" -ForegroundColor Yellow
        Write-Host "   - DATABASE_URL with your PostgreSQL connection string" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET with a secure random string" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key after you've updated .env file..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Cyan
Write-Host "This will create the database tables..." -ForegroundColor Gray
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Migration failed. Please check:" -ForegroundColor Red
    Write-Host "  1. PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  2. DATABASE_URL in .env is correct" -ForegroundColor Yellow
    Write-Host "  3. Database exists (or user has CREATE DATABASE permission)" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Database migrations completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Seeding database with initial data..." -ForegroundColor Cyan
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Seeding failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database seeded successfully" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "You can now start the backend server with:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To view/edit data in Prisma Studio:" -ForegroundColor Cyan
Write-Host "  npm run prisma:studio" -ForegroundColor White
Write-Host ""

