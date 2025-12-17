# BloodVista Deployment Guide

Complete guide for deploying BloodVista to Vercel with your own Supabase backend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (free tier works)
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
4. Configure the consent screen
5. Go to **APIs & Services** → **Credentials**
6. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://[your-project-id].supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**
8. In Supabase, go to **Authentication** → **Providers** → **Google**
9. Enable Google and paste your credentials

### Step 4: Configure Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set these URLs:

```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app
  - https://your-app.vercel.app/
  - https://your-app.vercel.app/auth
  - http://localhost:5173 (for local development)
  - http://localhost:8080 (for local development)
```

---

## GitHub Repository Setup

### Step 1: Export from Lovable

1. In Lovable, go to **Settings** → **GitHub**
2. Connect your GitHub account
3. Create a new repository

### Step 2: Clone Locally (Optional)

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Step 3: Update Environment Variables File

Create a `.env.example` file for reference:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**⚠️ Important**: Never commit actual API keys to GitHub. Use `.env.local` for local development.

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

## Environment Variables

### Complete List

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/Public key | Supabase → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | From URL: `https://[PROJECT_ID].supabase.co` |

### Local Development

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Then run:

```bash
npm install
npm run dev
```

---

## Post-Deployment Configuration

### Step 1: Update Supabase Redirect URLs

After deployment, add your actual Vercel URL:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your Vercel domain
3. Add the Vercel URL to **Redirect URLs**

### Step 2: Test Authentication

1. Visit your deployed app
2. Try signing up with email
3. Try logging in
4. Verify Google OAuth works (if configured)

### Step 3: Custom Domain (Optional)

**In Vercel:**
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS as instructed

**In Supabase:**
1. Update Site URL to your custom domain
2. Update Redirect URLs

---

## Troubleshooting

### Common Issues

#### "Invalid API key" or Auth Errors

- ✅ Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is correct
- ✅ Check you're using the **anon** key, not the **service_role** key
- ✅ Redeploy after updating environment variables

#### Google OAuth "redirect_uri_mismatch"

- ✅ Ensure redirect URI in Google Console matches: `https://[project-id].supabase.co/auth/v1/callback`
- ✅ Add your Vercel URL to Authorized JavaScript Origins

#### "requested path is invalid"

- ✅ Check Site URL is correctly set in Supabase
- ✅ Ensure redirect URLs include your app domain

#### Build Fails on Vercel

- ✅ Check all environment variables are set
- ✅ Verify build command is `npm run build`
- ✅ Check for TypeScript errors locally first

#### App Shows Blank Page

- ✅ Check browser console for errors
- ✅ Verify Supabase URL is correct
- ✅ Ensure environment variables have `VITE_` prefix

### Verifying Environment Variables

In your browser console, you can check if variables are loaded:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
```

---

## Quick Reference Commands

```bash
# Local development
npm install
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Security Checklist

- [ ] Never commit `.env` files with real credentials
- [ ] Use environment variables for all sensitive data
- [ ] Keep service_role key secret (never expose in frontend)
- [ ] Enable Row Level Security (RLS) on Supabase tables
- [ ] Set up proper redirect URLs in Supabase

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

---

**Last Updated**: December 2024
