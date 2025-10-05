#!/bin/bash

# Replace YOUR_USERNAME with your actual GitHub username
# Replace REPOSITORY_NAME with your chosen repository name

echo "🚀 Deploying Rice Bloom Search to GitHub..."

# Set the remote origin (replace with your actual GitHub repository URL)
git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPOSITORY_NAME.git

# Set the default branch name
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Successfully deployed to GitHub!"
echo "🌐 Your repository: https://github.com/YOUR_USERNAME/REPOSITORY_NAME"

# Instructions for deployment
echo ""
echo "🎯 Next Steps:"
echo "1. Go to your GitHub repository"
echo "2. Set up deployment on Vercel/Netlify"
echo "3. Configure environment variables"
echo "4. Your app will be live!"