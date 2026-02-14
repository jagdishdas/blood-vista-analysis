# Debugging Guide: "No response received from AI"

## Root Cause Analysis

The error "No response received from AI. Please try again." occurs on line 113 of `useChatBot.ts` when:
```typescript
!streamedContent && !response.content
```

This means the Supabase Edge Function is returning successfully, but the `content` field is empty or undefined.

## Most Likely Causes:

### 1. **Missing API Keys in Supabase** (MOST LIKELY)
The function executes but can't call any AI provider because no API keys are set.

**How to Check:**
1. Go to: https://supabase.com/dashboard/project/dkykhgjdshlwihvqtgfx/settings/functions
2. Click **"Secrets"** tab
3. Look for `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`

**If missing, add one:**
- Click **"New Secret"**
- Name: `GEMINI_API_KEY`
- Value: Get from https://makersuite.google.com/app/apikey
- Click **Save**

### 2. **Function Logs Show Error**
The function might be logging an error that we can't see from the frontend.

**How to Check:**
1. Go to: https://supabase.com/dashboard/project/dkykhgjdshlwihvqtgfx/functions
2. Click **bloodvista-chat**
3. Click **"Logs"** tab
4. Look for red error messages or status codes like 500, 401, 403

Common log errors:
- `"No AI provider API key configured"` → Need to set API key
- `"401 Unauthorized"` → API key is invalid
- `"429 Rate limit"` → Too many requests

### 3. **Response Format Mismatch**
The function might be returning data in the wrong format.

**Expected Format:**
```json
{
  "content": "AI response text here",
  "provider": "gemini"
}
```

**Check the function code** (lines 253-256 of `bloodvista-chat/index.ts`):
```typescript
return new Response(
  JSON.stringify({ content, provider: activeProvider }),
  { headers: { ...cors headers, "Content-Type": "application/json" } }
);
```

This looks correct.

## Quick Fix Steps:

### Step 1: Set API Key
```powershell
# If you have Supabase CLI installed:
supabase secrets set GEMINI_API_KEY=your-actual-key-here
```

OR use the dashboard:
1. Supabase Dashboard → Functions → Settings → Secrets
2. Add `GEMINI_API_KEY`

### Step 2: Verify Function is Deployed
Go to: https://supabase.com/dashboard/project/dkykhgjdshlwihvqtgfx/functions

You should see:
- ✅ bloodvista-chat (Status: ACTIVE)
- ✅ blood-analysis-enhance (Status: ACTIVE)
- ✅ google-vision-ocr (Status: ACTIVE)
- ✅ radiology-analysis (Status: ACTIVE)

### Step 3: Test Manually
After setting the API key, test the chat:
1. Open your app in browser
2. Open Developer Console (F12)
3. Click chat icon
4. Type a message
5. Check console for logs:
   - `"Supabase function error:"` → Copy the error
   - `"AI Client error:"` → Copy the error

### Step 4: Check Function Logs
If still failing:
1. Dashboard → Functions → bloodvista-chat → Logs
2. Send a test message
3. Refresh logs
4. Look for the most recent entry
5. Check for errors like:
   - "No AI provider API key configured"
   - "Invalid API key"
   - "Rate limit exceeded"

## Debug Output Checklist

When testing, check these in browser console:

```javascript
// You should see:
"Supabase function error:" // Should NOT appear if working
"AI Client error:" // Should NOT appear if working

// If you see either, the full error will follow
```

## Expected Success Flow:

1. User sends message
2. Frontend logs: `"Calling Supabase function: bloodvista-chat"`
3. Function logs: `"BloodVista Chat request received: { messageCount: X }"`
4. Function logs: `"Using AI provider: gemini"` (or openai)
5. Function logs: `"Calling AI API: https://..."`
6. Function logs: `"AI response received, length: XXX"`
7. Frontend shows the response

## If Nothing Works:

The issue is 99% likely to be **missing API keys**. Verify:

```bash
# Check what secrets are set (names only, not values)
supabase secrets list

# You should see at least ONE of:
# - GEMINI_API_KEY
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
```

If the list is empty or shows different keys, that's your problem!

## Quick Test:

Open browser console and run:
```javascript
// Test if Supabase client is working
const { data, error } = await window.supabase.functions.invoke('bloodvista-chat', {
  body: { messages: [{ role: 'user', content: 'Hello' }] }
});
console.log('Response:', data);
console.log('Error:', error);
```

Expected output:
- `Response: { content: "Hello! I'm...", provider: "gemini" }`
- `Error: null`

If you see error, copy the exact message!
