# Vercel Deployment Guide for Kodbank

## Quick Setup

### Option 1: Deploy Frontend Only (Recommended for Start)

1. **In Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository: `ritesh-1912/kodbank_app`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

2. **Set Environment Variable:**
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.vercel.app/api`
   - Or use your backend deployed elsewhere

### Option 2: Deploy Both Frontend + Backend Together

1. **In Vercel Dashboard:**
   - Root Directory: `.` (root)
   - Framework Preset: Other
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

2. **Set Environment Variables:**

   **Backend Variables:**
   ```
   DB_HOST=mysql-198b3adc-kodnestmovieapp1.i.aivencloud.com
   DB_PORT=11092
   DB_USER=avnadmin
   DB_PASSWORD=AVNS_M7yo71NtHrDchGDOicw
   DB_NAME=defaultdb
   JWT_SECRET=your_strong_random_secret_key_change_this_in_production
   JWT_EXPIRY=24h
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

   **Frontend Variable:**
   ```
   VITE_API_URL=https://your-app-name.vercel.app/api
   ```

   **Important:** Replace `your-app-name` with your actual Vercel project name after first deployment.

## Environment Variables Checklist

### Required Backend Variables:
- ✅ `DB_HOST` - Your Aiven MySQL host
- ✅ `DB_PORT` - Your Aiven MySQL port (11092)
- ✅ `DB_USER` - Your Aiven MySQL username
- ✅ `DB_PASSWORD` - Your Aiven MySQL password
- ✅ `DB_NAME` - Your database name (defaultdb)
- ✅ `JWT_SECRET` - A strong random secret key (change from default!)
- ✅ `JWT_EXPIRY` - Token expiry (24h)
- ✅ `FRONTEND_URL` - Your Vercel frontend URL (set after first deploy)

### Required Frontend Variable:
- ✅ `VITE_API_URL` - Your backend API URL (usually `/api` if same domain, or full URL if separate)

## Step-by-Step Deployment

### First Time Setup:

1. **Push code to GitHub** (already done ✅)

2. **Connect to Vercel:**
   - Go to vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Select `ritesh-1912/kodbank_app`

3. **Configure Project:**
   - Root Directory: `frontend` (for frontend-only) OR `.` (for full stack)
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all backend variables listed above
   - Add `VITE_API_URL` for frontend

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

6. **Update FRONTEND_URL:**
   - After first deployment, copy your Vercel URL
   - Go to Settings → Environment Variables
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy

## Important Notes

### CORS Configuration
- The backend automatically allows requests from your Vercel domain
- Make sure `FRONTEND_URL` matches your Vercel frontend URL exactly

### Cookies
- Cookies are set with `secure: true` in production (automatic)
- `sameSite: 'lax'` works with Vercel's HTTPS

### Database
- Make sure your Aiven database allows connections from Vercel
- SSL is already configured in the code
- Run `database-setup.sql` manually in Aiven console if needed

### API Routes
- Backend routes are at `/api/auth/*` and `/api/balance`
- Frontend should use `/api` as base URL (or full URL if separate deployment)

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+)

### CORS Errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Check that `VITE_API_URL` is set correctly

### Database Connection Fails
- Verify all DB environment variables are set
- Check Aiven database allows external connections
- Ensure SSL is enabled (already in code)

### Cookies Not Working
- Make sure `secure: true` is set (automatic in production)
- Check that `sameSite: 'lax'` is used (already set)
- Verify `withCredentials: true` in frontend API calls (already set)

## Testing After Deployment

1. ✅ Test registration: `/register`
2. ✅ Test login: `/login`
3. ✅ Test balance check: `/dashboard` → Check Balance button
4. ✅ Verify cookies are set (check browser DevTools)
5. ✅ Verify JWT tokens work

## Production Checklist

- [ ] All environment variables set
- [ ] `JWT_SECRET` changed from default
- [ ] `FRONTEND_URL` updated to Vercel URL
- [ ] Database tables created
- [ ] CORS configured correctly
- [ ] HTTPS working (automatic on Vercel)
- [ ] Cookies working with secure flag
- [ ] All features tested
