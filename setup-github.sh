#!/bin/bash

echo "🚀 Setting up GitHub repository for AI SEO Chat app..."
echo ""

# Check if we're in the right directory
if [ ! -f "shopify.app.toml" ]; then
    echo "❌ Error: Please run this script from the ai-seo-chat directory"
    exit 1
fi

echo "✅ Current directory: $(pwd)"
echo ""

# Check git status
echo "📋 Checking git status..."
git status
echo ""

# Ask for GitHub username
echo "🔗 Please enter your GitHub username:"
read -r github_username

if [ -z "$github_username" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

echo ""
echo "📝 Creating GitHub repository setup commands..."
echo ""

# Create the remote URL
remote_url="https://github.com/$github_username/ai-seo-chat.git"

echo "🔗 Remote URL will be: $remote_url"
echo ""

# Add remote
echo "➕ Adding remote repository..."
git remote add origin "$remote_url"

# Check if remote was added successfully
if git remote -v | grep -q "origin"; then
    echo "✅ Remote 'origin' added successfully!"
else
    echo "❌ Failed to add remote"
    exit 1
fi

echo ""
echo "📤 Pushing code to GitHub..."

# Set the main branch and push
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code has been pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit: https://github.com/$github_username/ai-seo-chat"
    echo "2. Go to Vercel Dashboard: https://vercel.com/dashboard"
    echo "3. Click 'New Project' and import your GitHub repository"
    echo "4. Configure environment variables in Vercel"
    echo "5. Deploy automatically!"
    echo ""
    echo "🔗 Your GitHub repository: https://github.com/$github_username/ai-seo-chat"
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "✅ Setup complete! Your app is now on GitHub and ready for Vercel integration!"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub credentials and try again"
    exit 1
fi
