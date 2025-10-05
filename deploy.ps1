# PowerShell script to deploy to GitHub
# Replace YOUR_USERNAME with your actual GitHub username
# Replace REPOSITORY_NAME with your chosen repository name

Write-Host "🚀 Deploying Rice Bloom Search to GitHub..." -ForegroundColor Green

# Check if remote origin already exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    # Add remote origin (replace with your actual GitHub repository URL)
    Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
    # git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
    
    Write-Host "⚠️  Please replace YOUR_USERNAME and REPOSITORY_NAME with actual values!" -ForegroundColor Red
    Write-Host "Example: git remote add origin https://github.com/yourusername/rice-store-admin.git" -ForegroundColor Cyan
    Read-Host "Press Enter after you've set the remote URL..."
}

# Set default branch name
Write-Host "Setting main branch..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Check your GitHub repository for the uploaded code" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Magenta
    Write-Host "1. Go to your GitHub repository" -ForegroundColor White
    Write-Host "2. Set up deployment on Vercel or Netlify" -ForegroundColor White
    Write-Host "3. Configure environment variables:" -ForegroundColor White
    Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   - VITE_SUPABASE_PUBLISHABLE_KEY" -ForegroundColor Gray
    Write-Host "   - VITE_SUPABASE_PROJECT_ID" -ForegroundColor Gray
    Write-Host "4. Your app will be live! 🎉" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed. Please check the error messages above." -ForegroundColor Red
}