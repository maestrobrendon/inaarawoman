# Fix 404 Error on Vercel - Complete Guide

## The Problem
Your React SPA (Single Page Application) shows 404 errors when:
- Refreshing any page other than the homepage
- Directly accessing URLs like `/shop`, `/about`, etc.

## The Solution

### Step 1: Verify vercel.json is in Root Directory
The `vercel.json` file MUST be in the root of your project (not in `/public`).

**Current location:** ✅ `/vercel.json` (at project root)

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to your project on https://vercel.com/dashboard
2. Click on your project "inaarawoman"
3. Go to **Settings** → **General** → Scroll to bottom
4. Click **"Redeploy"** or push new code to trigger a deployment

#### Option B: Via Git (Recommended)
```bash
# Commit the new vercel.json file
git add vercel.json
git commit -m "Fix: Add Vercel SPA routing configuration"
git push origin main
```

This will automatically trigger a new deployment on Vercel.

### Step 3: Clear Vercel Cache (If Issue Persists)

If the problem continues after deployment:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **General**
3. Scroll to **"Build & Development Settings"**
4. Enable **"Override"** and set:
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
5. Click **Save**
6. Go to **Deployments** tab
7. Click on the latest deployment
8. Click **"..."** (three dots) → **"Redeploy"**
9. ✅ Check **"Use existing Build Cache"** is UNCHECKED
10. Click **Redeploy**

### Step 4: Verify the Fix

After deployment completes, test these URLs:
- ✅ `https://www.inaarawoman.com/shop`
- ✅ `https://www.inaarawoman.com/about`
- ✅ `https://www.inaarawoman.com/contact`
- ✅ Refresh any page - should work without 404

## How It Works

The `vercel.json` configuration tells Vercel:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This means: "For ANY route requested, serve `/index.html` and let React Router handle the client-side routing."

## Still Having Issues?

If the problem persists after following all steps:

1. Check the Vercel deployment logs for errors
2. Verify the build completed successfully
3. Ensure `vercel.json` was included in the deployment (check the "Source" tab in deployment details)
4. Try accessing the site in incognito mode to rule out browser cache

## Quick Test in Development

To test this locally with Vite's preview mode:
```bash
npm run build
npm run preview
```

Then try accessing `http://localhost:4173/shop` directly.
