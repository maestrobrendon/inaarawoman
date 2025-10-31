# Setting Up Cloudinary Environment Variables in Vercel

## Quick Steps

1. **Go to your Vercel project dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Open Environment Variables settings**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add the required variables**

   Add these two environment variables:

   ```
   Key: VITE_CLOUDINARY_CLOUD_NAME
   Value: dusynu0kv
   ```

   ```
   Key: VITE_CLOUDINARY_UPLOAD_PRESET
   Value: inaara_products
   ```

4. **Important: Set environment for all environments**
   - For each variable, select **Production**, **Preview**, and **Development** checkboxes
   - Click **Save** after adding each variable

5. **Redeploy your application**
   - Go to **Deployments** tab
   - Click the **...** (three dots) menu on your latest deployment
   - Select **Redeploy**
   - OR push a new commit to trigger a new deployment

## Detailed Instructions with Screenshots Locations

### Step 1: Navigate to Settings
- Project Dashboard → **Settings** tab (top navigation)

### Step 2: Environment Variables Section
- Left sidebar → **Environment Variables**

### Step 3: Adding Variables
1. In the **Key** field, enter: `VITE_CLOUDINARY_CLOUD_NAME`
2. In the **Value** field, enter: `dusynu0kv`
3. **Important**: Check all environment boxes:
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development
4. Click **Save**

5. Repeat for the second variable:
   - **Key**: `VITE_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: `inaara_products`
   - Select all environments
   - Click **Save**

### Step 4: Redeploy
**Why redeploy?** Environment variables are only available at build time in Vite. A redeploy ensures the new variables are included in your build.

**How to redeploy:**
- **Option A**: Go to **Deployments** → Click **...** → **Redeploy**
- **Option B**: Push a new commit (even a small change)
- **Option C**: Use Vercel CLI: `vercel --prod`

## Verification

After redeploying, you can verify the variables are working by:

1. Opening your deployed app's browser console
2. Trying to upload an image
3. Check the console logs - you should see "Cloudinary Config Check" logs (in development) or successful uploads (in production)

## Common Issues

### Issue: "Environment variables not found" after adding them
**Solution**: You must redeploy! Vite bundles environment variables at build time, not runtime.

### Issue: Variables work locally but not in production
**Solution**: 
1. Verify variables are added for **Production** environment (not just Development)
2. Ensure variable names start with `VITE_` prefix
3. Redeploy after adding variables

### Issue: Variables show as "undefined" in console
**Solution**:
- Double-check the variable names match exactly (case-sensitive)
- Ensure variables are saved with all environment checkboxes selected
- Redeploy the application

## Your Current Configuration

```
VITE_CLOUDINARY_CLOUD_NAME=dusynu0kv
VITE_CLOUDINARY_UPLOAD_PRESET=inaara_products
```

## Additional Notes

- **VITE_ prefix is required**: Vite only exposes environment variables to client-side code if they start with `VITE_`
- **Build-time only**: These variables are bundled into your app at build time, not available at runtime
- **Security**: Since these use `VITE_` prefix, they will be visible in the client bundle. For unsigned upload presets (like yours), this is safe.

## Support

If you continue to have issues:
1. Check Vercel deployment logs for any build errors
2. Verify the variables are showing in Vercel dashboard
3. Ensure you've redeployed after adding variables
4. Check browser console for detailed error messages

