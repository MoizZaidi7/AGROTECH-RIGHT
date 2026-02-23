# Vercel Deployment Instructions

## Configuration Files Added

1. **vercel.json** - Vercel build configuration
2. **.env.production** - Production environment variables
3. **.vercelignore** - Files to ignore during deployment

## Environment Variables

Make sure to add these environment variables in your Vercel project settings:

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
REACT_APP_API_URL=https://agrotech-right.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51SHPB3FCPJjEiureycjBIse0d8c9RdBKblUhBcW3Cv1Hc5zXSTyklRW3AGH84eN3YQajju1bItvSkJPXASE7NKlg00oFFPK7Ds
CI=false
GENERATE_SOURCEMAP=false
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the frontend directory:
   ```bash
   cd frontend
   vercel
   ```

### Option 2: Deploy via Git Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Set the root directory to `frontend`
6. Add the environment variables listed above
7. Click "Deploy"

## Build Configuration

The build script has been updated to:
```json
"build": "CI=false react-scripts build"
```

This prevents the build from failing on ESLint warnings in production.

## Troubleshooting

If deployment fails:

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Ensure all dependencies** are in package.json
4. **Check that the backend API** (https://agrotech-right.onrender.com) is running
5. **Clear Vercel build cache** and redeploy

## Backend CORS Configuration

Make sure your backend allows requests from your Vercel domain. Update CORS settings in your backend to include:
- Your Vercel production URL (e.g., `https://your-app.vercel.app`)
- Or use a wildcard for development: `*`

## Post-Deployment Checklist

✅ Environment variables set in Vercel
✅ Backend API is accessible
✅ CORS is configured on backend
✅ All API endpoints use REACT_APP_API_URL environment variable
✅ Build completes successfully
✅ No console errors in production
