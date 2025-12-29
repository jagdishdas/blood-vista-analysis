# Setting Up Gemini API for BloodVista Chatbot

## Quick Setup Guide

### Step 1: Get Your Gemini API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select a Google Cloud project (or create a new one)
4. Copy the API key (starts with `AIzaSy...`)

### Step 2: Add to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your `blood-vista-analysis` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your API key from Step 1
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy

After adding the environment variable, redeploy:
- Go to **Deployments** tab
- Click the three dots menu on the latest deployment
- Select **Redeploy**
- OR: Simply push a new commit to trigger redeployment

## Why Gemini?

✅ **Generous Free Tier**: 15 requests/minute, 1,500 requests/day  
✅ **Fast Response**: Gemini 1.5 Flash is optimized for speed  
✅ **Good for Medical**: Excellent at explaining medical concepts  
✅ **Automatic Fallback**: If Gemini fails, system falls back to OpenAI (if configured)

## Testing

After deployment, test the chatbot:
1. Log into your application
2. Open the chatbot
3. Ask a medical question like: "What does high cholesterol mean?"
4. You should get a comprehensive response

## API Limits (Gemini Free Tier)

- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 1 million
- **Tokens per day**: 1,500

This is more than enough for typical usage!

## Optional: Add OpenAI as Fallback

For extra reliability, you can also set `OPENAI_API_KEY`:
1. Get key from: https://platform.openai.com/api-keys
2. Add to Vercel as `OPENAI_API_KEY`
3. System will try Gemini first, then fall back to OpenAI if needed

## Troubleshooting

**Chatbot not responding?**
- Check Vercel logs: `Settings` → `Logs`
- Verify API key is set correctly
- Make sure you redeployed after adding the key

**"Quota exceeded" error?**
- Free tier limits reached
- Wait for limits to reset (per minute/day)
- Consider upgrading to paid tier or adding OpenAI as fallback

**Need help?**
- Check Vercel deployment logs for detailed error messages
- Verify the API key starts with `AIzaSy`
- Make sure the key is enabled for "Gemini API"
