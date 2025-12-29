# Environment Variables Configuration Guide

This document outlines all required environment variables for the BloodVista application deployment.

## Vercel Environment Variables

Set these in your Vercel project dashboard: `https://vercel.com/<your-project>/settings/environment-variables`

### Required Variables

#### `GEMINI_API_KEY` (Recommended)
- **Purpose**: Powers AI-driven chat assistant and analysis (Primary AI provider)
- **Format**: `AIzaSy...` (Google AI Studio API key)
- **How to get**: Create at https://aistudio.google.com/app/apikey
- **Required for**: Chat feature
- **Note**: If both GEMINI_API_KEY and OPENAI_API_KEY are set, Gemini will be tried first with automatic fallback to OpenAI

#### `OPENAI_API_KEY` (Alternative/Fallback)
- **Purpose**: Powers AI-driven chat assistant (Fallback AI provider)
- **Format**: `sk-...` (OpenAI API key)
- **How to get**: Create at https://platform.openai.com/api-keys
- **Required for**: Chat feature (if GEMINI_API_KEY not set)
- **Note**: You can set both keys for automatic fallback

#### `VITE_SUPABASE_URL`
- **Purpose**: Supabase project URL for database and edge functions
- **Format**: `https://[project-id].supabase.co`
- **How to get**: From Supabase project settings
- **Required for**: Authentication, OCR processing, data storage

#### `VITE_SUPABASE_ANON_KEY`
- **Purpose**: Anonymous/public key for Supabase client
- **Format**: Long JWT token starting with `eyJ...`
- **How to get**: From Supabase project API settings
- **Required for**: Client-side Supabase operations

### How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `GEMINI_API_KEY`)
   - **Value**: The actual value
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**
5. Redeploy your application for changes to take effect

**Recommended Setup**:
- Set `GEMINI_API_KEY` for the chat feature (recommended - free tier available)
- Optionally set `OPENAI_API_KEY` as fallback
- Set both Supabase variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

---

## Supabase Secrets (Edge Functions)

Set these using the Supabase CLI: `supabase secrets set VARIABLE_NAME="value"`

### Required Secrets for Google Vision OCR

#### `GOOGLE_CLOUD_PROJECT_ID`
- **Purpose**: Your Google Cloud project identifier
- **Format**: string (e.g., `my-project-12345`)
- **How to get**: From Google Cloud Console → Project Info

#### `GOOGLE_CLOUD_CLIENT_EMAIL`
- **Purpose**: Service account email for authentication
- **Format**: `service-account-name@project-id.iam.gserviceaccount.com`
- **How to get**: 
  1. Go to Google Cloud Console → IAM & Admin → Service Accounts
  2. Create a service account or use existing
  3. Copy the email address

#### `GOOGLE_CLOUD_PRIVATE_KEY`
- **Purpose**: Private key for service account authentication
- **Format**: RSA private key in PEM format
- **How to get**:
  1. Go to Google Cloud Console → IAM & Admin → Service Accounts
  2. Select your service account → Keys → Add Key → Create New Key
  3. Choose JSON format and download
  4. Extract the `private_key` field from the JSON file

**CRITICAL - Proper Formatting:**

The private key must preserve newline characters. When setting the secret, use one of these methods:

**Method 1: Direct paste (recommended)**
```bash
supabase secrets set GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...multiple lines...
...aD4hH+vQ==
-----END PRIVATE KEY-----"
```

**Method 2: From file**
```bash
# Save private key to file first: private-key.pem
supabase secrets set GOOGLE_CLOUD_PRIVATE_KEY="$(cat private-key.pem)"
```

**Method 3: Use escaped newlines**
```bash
supabase secrets set GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----"
```

> **Note**: The Supabase function automatically handles `\n` → actual newline conversion, but your key MUST include the BEGIN and END markers.

### How to Set Supabase Secrets

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link to your project: `supabase link --project-ref <your-project-id>`
4. Set each secret:
   ```bash
   supabase secrets set GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   supabase secrets set GOOGLE_CLOUD_CLIENT_EMAIL="your-email@project.iam.gserviceaccount.com"
   supabase secrets set GOOGLE_CLOUD_PRIVATE_KEY="$(cat your-key.pem)"
   ```
5. Verify secrets are set: `supabase secrets list`
6. Redeploy the edge function: `supabase functions deploy google-vision-ocr`

---

## Verification Checklist

### Before Deployment

- [ ] All Vercel environment variables set
- [ ] All Supabase secrets set
- [ ] Private key format validated (contains BEGIN/END markers)
- [ ] Edge function deployed: `supabase functions deploy google-vision-ocr`

### After Deployment

- [ ] Test chat feature (requires `OPENAI_API_KEY`)
- [ ] Test radiology analysis with large image (>5MB original)
- [ ] Test blood test PDF upload (Google Vision or Tesseract fallback)
- [ ] Check browser console for "Google Vision failed, falling back" if auth issues exist
- [ ] Verify no 413 payload errors

---

## Troubleshooting

### Common Issues

**Issue: "No AI API keys configured"**
- **Solution**: Set either `GEMINI_API_KEY` (recommended) or `OPENAI_API_KEY` in Vercel
- **Recommended**: Use Gemini API - it has a generous free tier
- **Get Gemini Key**: https://aistudio.google.com/app/apikey
- After setting, redeploy your application

**Issue: "Gemini API error" or "OpenAI API error"**
- **Solution**: 
  - Verify the API key is correct and active
  - Check if you have quota/credits remaining
  - If using both keys, the system will automatically try the fallback
  - Gemini free tier: 15 requests per minute, 1500 per day

**Issue: "Google Cloud credentials not configured"**
- **Solution**: Check all three Google Cloud secrets are set in Supabase
- Run: `supabase secrets list` to verify

**Issue: "Invalid private key format"**
- **Solution**: 
  - Verify key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
  - Check newlines are preserved (use `cat` method or direct paste)
  - View Supabase function logs: `supabase functions logs google-vision-ocr`

**Issue: "Token exchange failed"**
- **Solution**:
  - Enable Cloud Vision API in Google Cloud Console
  - Ensure service account has "Cloud Vision API User" role
  - Check Supabase function logs for detailed error message

**Issue: "Payload too large (413)"**
- **Solution**: This should now be fixed with Node.js serverless functions
- If still occurring, check image compression logs in browser console
- Original image may be extraordinarily large (>10MB) - compression should reduce to <3.5MB

### Viewing Logs

**Vercel Logs (API routes):**
```bash
vercel logs <deployment-url>
```

**Supabase Edge Function Logs:**
```bash
supabase functions logs google-vision-ocr --project-ref <project-id>
```

**Browser Console:**
- Open DevTools → Console tab
- Look for compression logs, fallback warnings, and API errors
