# Chatbot Debugging Guide

## Quick Checklist

If your chatbot is not working, go through these steps:

### 1. ✅ Verify API Keys are Set in Vercel

**Check Gemini API Key:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `GEMINI_API_KEY`
3. Make sure it's set for all environments (Production, Preview, Development)

**Check OpenAI API Key (if using):**
1. Look for `OPENAI_API_KEY`
2. Make sure it's set for all environments

### 2. ✅ Redeploy After Adding/Changing Keys

Environment variables require a redeploy to take effect:
1. Go to Deployments
2. Click "..." menu on latest deployment
3. Select "Redeploy"

OR push a new commit to trigger auto-deployment

### 3. ✅ Test the API Endpoint Directly

Open your browser dev tools (F12) and test the API:

```javascript
//Replace with your actual deployment URL
fetch('https://your-app.vercel.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected Response:**
```json
{
  "content": "Hello! I'm BloodVista Assistant...",
  "provider": "gemini"
}
```

**Error Response Examples:**
- `"No AI API keys configured"` → Keys not set in Vercel
- `"Gemini API error: 400"` → Invalid API key
- `"Rate limit exceeded"` → Too many requests

### 4. ✅ Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Click on "chat" function
5. View logs for actual errors

### 5. ✅ Check Browser Console

1. Open your app
2. Open DevTools (F12) → Console tab
3. Click chatbot button
4. Send a message
5 Check for any JavaScript errors

Common errors:
- `Failed to fetch` → Network/CORS issue
- `404 Not Found` → API route not deployed
- `500 Internal Server Error` → Server-side error (check Vercel logs)

### 6. ✅ Verify Gemini API Key is Valid

1. Go to https://aistudio.google.com/app/apikey
2. Make sure your key is active
3. Try generating a new key if needed
4. Test the key directly:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY_HERE" \
  -H 'Content-Type: application/json' \
  -d '{ "contents": [{ "parts": [{ "text": "Hello" }] }] }'
```

## Common Issues & Solutions

### Issue: "No AI API keys configured"
**Solution**: 
- API keys not set in Vercel deployment
- Go to Vercel → Settings → Environment Variables
- Add `GEMINI_API_KEY` (or `OPENAI_API_KEY`)
- Redeploy

### Issue: Chatbot button appears but nothing happens
**Solution**:
- Check browser console for JavaScript errors
- Ensure `api/chat.ts` is deployed (check Vercel Functions tab)
- Try clearing browser cache

### Issue: "Failed to fetch" error
**Solution**:
- CORS or network issue
- Check if `/api/chat` endpoint is accessible
- Try accessing https://your-app.vercel.app/api/chat directly (should return "Method not allowed" for GET)

### Issue: Long delay then timeout
**Solution**:
- Vercel function timeout (max 60s on hobby plan)
- Check Vercel function logs for actual error
- May need to upgrade Vercel plan

### Issue: Works in development but not production
**Solution**:
- Environment variables not set in production
- Make sure keys are set for "Production" environment in Vercel
- Redeploy

## Testing Locally

To test locally with Vercel dev server:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server (includes API routes)
vercel dev

# In browser, chatbot should work at http://localhost:3000
```

Make sure you have a `.env` file:
```env
GEMINI_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here
```

## Still Not Working?

1. Share the error message you're seeing
2. Check Vercel function logs and share the error
3. Verify which deployment URL you're testing
4. Confirm API keys are actually set in Vercel (not just locally)
