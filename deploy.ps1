# PowerShell deployment script
Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Copy server configuration files
Write-Host "📋 Copying server configuration files..." -ForegroundColor Yellow
Copy-Item .htaccess build\ -Force -ErrorAction SilentlyContinue
Copy-Item _headers build\ -Force -ErrorAction SilentlyContinue

# Create .nojekyll file for GitHub Pages
New-Item -Path "build\.nojekyll" -ItemType File -Force | Out-Null

Write-Host "✅ Build complete! Files ready in ./build directory" -ForegroundColor Green
Write-Host "📁 Deploy the contents of the ./build folder to your web server" -ForegroundColor Cyan

# Optional: Commit and push changes
$commit = Read-Host "Do you want to commit and push changes? (y/N)"
if ($commit -eq 'y' -or $commit -eq 'Y') {
    git add .
    $message = Read-Host "Enter commit message (default: 'Deploy updates')"
    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "Deploy updates"
    }
    git commit -m $message
    git push
    Write-Host "✅ Changes committed and pushed!" -ForegroundColor Green
}

Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green