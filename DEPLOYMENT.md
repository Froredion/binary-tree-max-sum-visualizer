# GitHub Pages Deployment Guide

## Prerequisites

✅ Package.json is already configured with:

- `homepage` field
- `gh-pages` package installed
- Deploy scripts added

## Step-by-Step Deployment

### 1. Configuration

✅ **Already configured** for repository: `binary-tree-max-sum-visualizer`

```json
"homepage": "https://froredion.github.io/binary-tree-max-sum-visualizer",
```

### 2. Create a GitHub Repository

✅ **Repository already created**: [binary-tree-max-sum-visualizer](https://github.com/Froredion/binary-tree-max-sum-visualizer)

### 3. Initialize Git and Push to GitHub

Run these commands in your terminal (one at a time):

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit: Binary Tree Visualizer"

# Add your GitHub repository as remote
git remote add origin https://github.com/Froredion/binary-tree-max-sum-visualizer.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Deploy to GitHub Pages

Once your code is pushed to GitHub, run:

```bash
npm run deploy
```

This command will:

- Build your React app for production
- Create a `gh-pages` branch
- Deploy the build folder to that branch

### 5. Enable GitHub Pages (First time only)

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, it should already show: `gh-pages` branch with `/ (root)` folder
5. If not, select `gh-pages` branch and click **Save**

### 6. Access Your Live Site

After a few minutes, your site will be live at:

```
https://froredion.github.io/binary-tree-max-sum-visualizer
```

⏱️ **Note**: First deployment can take 5-10 minutes to go live.

## Updating Your Site

Whenever you make changes and want to update the live site:

```bash
# Make your changes to the code
# Then commit and push to GitHub
git add .
git commit -m "Your commit message"
git push

# Deploy the updates
npm run deploy
```

## Troubleshooting

### Blank Page After Deployment

If you see a blank page, check:

1. Is the `homepage` field in `package.json` correct? (Should be: `https://froredion.github.io/binary-tree-max-sum-visualizer`)
2. Did you wait 5-10 minutes for the first deployment?
3. Check browser console for any errors

### 404 Error

- Make sure GitHub Pages is enabled in repository Settings → Pages
- Verify the source is set to `gh-pages` branch

### Build Errors

If `npm run deploy` fails:

```bash
# Try building locally first
npm run build

# If that works, try deploying again
npm run deploy
```

## Summary of Commands

```bash
# One-time setup
npm install                                    # Install dependencies
git init                                       # Initialize git
git add .                                      # Stage all files
git commit -m "Initial commit"                 # Commit
git remote add origin https://github.com/Froredion/binary-tree-max-sum-visualizer.git
git push -u origin main                        # Push to GitHub

# Deploy to GitHub Pages
npm run deploy                                 # Deploy to gh-pages

# Future updates
git add .
git commit -m "Update message"
git push
npm run deploy
```

---

🎉 Once deployed, share your live site URL with others so they can use your visualizer!
