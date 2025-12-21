# BloodVista Deployment Guide

Complete guide for deploying BloodVista to Vercel or Netlify with your own Supabase backend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Netlify Deployment](#netlify-deployment)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Authentication Troubleshooting](#authentication-troubleshooting)
9. [General Troubleshooting](#general-troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Vercel OR Netlify account (free tier works)
- [ ] Supabase account (free tier works)
- [ ] Your project code exported to GitHub

---

## Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the details:
   - **Project name**: `bloodvista` (or your preferred name)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for the project to be provisioned (2-3 minutes)

### Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy and save these values:

```
SUPABASE_URL: https://[your-project-id].supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important**: The `anon` key is safe to expose in frontend code. Never expose the `service_role` key!

### Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. Go to **Authentication** → **Settings**
4. Under **Email Auth**:
   - Toggle **"Enable email confirmations"** to **OFF** (for easier testing)
   - Or keep it ON for production

#### For Google OAuth (Optional):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **OAuth consent screen**
4. Configure the consent screen:
   - User Type: External
   - App name: BloodVista
   - Support email: Your email
   - Developer contact: Your email
5. Go to **APIs & Services** → **Credentials**
6. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: BloodVista Web Client
   - Authorized JavaScript origins:
     - `https://your-app.vercel.app` (or your Netlify URL)
     - `http://localhost:8080` (for local development)
   - Authorized redirect URIs:
     - `https://[your-project-id].supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**
8. In Supabase, go to **Authentication** → **Providers** → **Google**
9. Enable Google and paste your credentials

### Step 4: Configure Redirect URLs (CRITICAL!)

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set these URLs:

```
Site URL: https://your-app.vercel.app

Redirect URLs (add ALL of these):
  - https://your-app.vercel.app
  - https://your-app.vercel.app/
  - https://your-app.vercel.app/auth
  - https://your-app.vercel.app/*
  - http://localhost:8080
  - http://localhost:8080/
  - http://localhost:8080/auth
  - http://localhost:5173
```

**⚠️ This is the #1 cause of authentication errors!** Make sure your deployment URL matches exactly.

---

## GitHub Repository Setup

### Step 1: Export Your Code

1. Download or export your project code to a local folder
2. Initialize a new Git repository (if not already):

```bash
cd your-project-folder
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### Step 3: Verify Environment Setup

Ensure you have these files in your repository:

- `.env.example` (template for environment variables)
- `.gitignore` (should include `.env` and `.env.local`)

**⚠️ Important**: Never commit `.env` files with real credentials to GitHub!

---

## Vercel Deployment

### Step 1: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Select the repository from the list

### Step 2: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://[your-project-id].supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` (your anon key) | Production, Preview, Development |
| `VITE_SUPABASE_PROJECT_ID` | `your-project-id` | Production, Preview, Development |

**How to add:**
1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable with the correct value
4. Select all environments (Production, Preview, Development)
5. Click **Save**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## Netlify Deployment

### Step 1: Connect to Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose GitHub and select your repository

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Publish Directory | `dist` |

### Step 3: Add Environment Variables

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Add a variable"** → **"Add single variable"**
3. Add each variable:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://[your-project-id].supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

### Step 4: Create Redirect Rules

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures client-side routing works correctly.

### Step 5: Deploy

1. Commit and push the `netlify.toml` file
2. Netlify will auto-deploy on push
3. Your app will be live at `https://your-site.netlify.app`

---

## Environment Variables

### Complete List

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/Public key | Supabase → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | From URL: `https://[PROJECT_ID].supabase.co` |

### Local Development

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=your-project-id
```

3. Run the development server:
```bash
npm install
npm run dev
```

---

## Post-Deployment Configuration

### Step 1: Update Supabase Redirect URLs

After deployment, add your actual deployment URL:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your deployment domain (e.g., `https://your-app.vercel.app`)
3. Add the deployment URL to **Redirect URLs**

### Step 2: Test Authentication

1. Visit your deployed app
2. Go to `/auth` page
3. Try signing up with email
4. Try logging in
5. Test Google OAuth (if configured)

### Step 3: Custom Domain (Optional)

**In Vercel:**
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS as instructed

**In Netlify:**
1. Go to **Domain settings**
2. Add your custom domain
3. Configure DNS as instructed

**In Supabase:**
1. Update Site URL to your custom domain
2. Add custom domain to Redirect URLs

---

## Authentication Troubleshooting

### "requested path is invalid"

**Cause**: Site URL or Redirect URLs are misconfigured in Supabase.

**Fix**:
1. Go to Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your EXACT deployment URL (e.g., `https://your-app.vercel.app`)
3. Add these to **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/`
   - `https://your-app.vercel.app/auth`
   - `https://your-app.vercel.app/*`

### Google OAuth "redirect_uri_mismatch"

**Cause**: Google OAuth callback URL doesn't match what's configured.

**Fix**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   - `https://[your-supabase-project-id].supabase.co/auth/v1/callback`
4. Under **Authorized JavaScript origins**, add:
   - `https://your-app.vercel.app` (your deployment URL)
   - `http://localhost:8080` (for local testing)

### "Invalid login credentials"

**Cause**: User doesn't exist or password is wrong.

**Fix**:
1. Make sure you're using the correct email/password
2. Check if user exists in Supabase → Authentication → Users
3. If testing, try creating a new account first

### Email confirmation not received

**Cause**: Email confirmations are enabled but email isn't configured.

**Fix** (for testing):
1. Go to Supabase → Authentication → Settings
2. Under **Email Auth**, toggle **"Enable email confirmations"** to OFF
3. This allows instant sign-up without email verification

### Session not persisting after login

**Cause**: Auth state isn't being properly managed.

**Fix**: The app already handles this correctly with `onAuthStateChange`. If still having issues:
1. Clear browser localStorage and cookies
2. Try in an incognito window
3. Check browser console for errors

### Login works but redirects to localhost

**Cause**: `window.location.origin` is being evaluated at the wrong time or redirect URL is hardcoded.

**Fix**: Ensure your Supabase redirect URLs include your production URL, not localhost.

---

## General Troubleshooting

### "Invalid API key" or Auth Errors

- ✅ Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is correct
- ✅ Check you're using the **anon** key, not the **service_role** key
- ✅ Redeploy after updating environment variables
- ✅ Check the key hasn't been regenerated in Supabase

### Build Fails on Vercel/Netlify

- ✅ Check all environment variables are set
- ✅ Verify build command is `npm run build`
- ✅ Check for TypeScript errors: `npx tsc --noEmit`
- ✅ Ensure all dependencies are in `package.json`

### App Shows Blank Page

- ✅ Check browser console (F12) for errors
- ✅ Verify Supabase URL is correct
- ✅ Ensure environment variables have `VITE_` prefix
- ✅ Try hard refresh (Ctrl+Shift+R)

### 404 on Page Refresh (Netlify)

- ✅ Ensure `netlify.toml` has redirect rules
- ✅ The `[[redirects]]` block should redirect all paths to `/index.html`

### Verifying Environment Variables

In your browser console, you can check if variables are loaded:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

If these show `undefined`, your environment variables aren't set correctly.

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

---

## Security Checklist

- [ ] Never commit `.env` files with real credentials
- [ ] Use environment variables for all sensitive data
- [ ] Keep `service_role` key secret (never expose in frontend)
- [ ] Enable Row Level Security (RLS) on Supabase tables
- [ ] Set up proper redirect URLs in Supabase
- [ ] Review Google OAuth scopes (only request what you need)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Your Domain                          │
│                  (your-app.vercel.app)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel / Netlify                         │
│                    (Static Hosting)                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application (Vite)                │   │
│  │  - Components, Pages, Routing                       │   │
│  │  - Tailwind CSS, shadcn/ui                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│              (your-project.supabase.co)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Database   │  │   Storage    │      │
│  │  (Users)     │  │ (PostgreSQL) │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Vite Documentation](https://vitejs.dev/guide/)

---

**Last Updated**: December 2024
