# BloodVista Deployment Guide - Next-Gen Architecture

## Prerequisites

- Supabase Account (free tier works)
- Vercel Account (or other hosting)
- Environment Variables ready

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter:
   - Project Name: `blood-vista-production`
   - Database Password: (generate strong password)
   - Region: (closest to users)
4. Wait for project initialization (~2 minutes)

### 1.2 Run Database Migration
1. Copy the SQL from `supabase/migrations/20260201_create_blood_vista_schema.sql`
2. In Supabase Dashboard:
   - Go to SQL Editor
   - Click "New Query"
   - Paste the migration SQL
   - Click "Run"
3. Verify tables created:
   - Go to Table Editor
   - Should see: `profiles`, `blood_tests`, `test_parameters`, `family_profiles`, `trend_snapshots`, `radiology_scans`

### 1.3 Get API Credentials
1. In Supabase Dashboard, go to Settings → API
2. Copy these values:
   - `Project URL`
   - `anon public` key

---

## Step 2: Environment Configuration

### 2.1 Local Development
Create/update `.env` file:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key

# AI Keys (existing)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

### 2.2 Production (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`

---

## Step 3: Application Deployment

### 3.1 Build Test
```bash
npm install
npm run build
```

Verify no TypeScript errors.

### 3.2 Local Test
```bash
npm run dev
```

Test:
1. Sign up with test user
2. Complete profile onboarding
3. Upload blood test
4. Verify results save to database (check Supabase Table Editor)

### 3.3 Deploy to Production
```bash
git add .
git commit -m "Add Next-Gen database persistence"
git push origin main
```

Vercel will auto-deploy.

---

## Step 4: Post-Deployment Verification

### 4.1 Smoke Tests
1. **Authentication**: Sign up new user
2. **Onboarding**: Complete profile
3. **Blood Test**: Upload and analyze report
4. **Persistence**: Refresh page, verify data persists
5. **AI Chat**: Ask question, verify longitudinal context

### 4.2 Database Checks
In Supabase Dashboard:
1. Go to Table Editor → `profiles`
   - Verify test user exists
2. Go to `blood_tests`
   - Verify test saved
3. Go to `test_parameters`
   - Verify individual parameters saved

---

## Step 5: Monitoring Setup

### 5.1 Supabase Monitoring
1. Dashboard → Database → Usage
   - Monitor connection pool
   - Check query performance
2. Dashboard → Auth → Users
   - Monitor sign-ups

### 5.2 Error Tracking (Optional)
Add Sentry or similar:
```bash
npm install @sentry/react
```

---

## Troubleshooting

### Issue: "Missing environment variables"
**Solution**: Ensure all `VITE_SUPABASE_*` variables are set in `.env` and Vercel

### Issue: "Failed to save blood test"
**Solution**: 
1. Check browser console for errors
2. Verify user is authenticated
3. Check Supabase → Database → Logs for errors
4. Verify RLS policies are enabled

### Issue: "Profile not found"
**Solution**:
1. User must complete onboarding first
2. Check if `profiles` table has RLS policy allowing insert

### Issue: AI not using historical context
**Solution**:
1. Verify `aiContextService` is imported in `api/chat.ts`
2. Check if user has previous test history in database
3. Enable debugging in `assembleAIContext()` function

---

## Rollback Procedure

If critical issue after deployment:

1. **Code Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database is Safe**: 
   - Migration is additive only
   - Old code ignores new tables
   - No data loss risk

3. **Disable Features**:
   - Comment out profile onboarding redirect
   - Use old stateless flow temporarily

---

## Performance Optimization

### Database Indexes (Already Applied)
- `idx_blood_tests_user_date`
- `idx_test_parameters_test`
- `idx_test_parameters_param`

### Future Optimizations
1. **Connection Pooling**: Already handled by Supabase
2. **Query Caching**: Consider React Query
3. **Pagination**: For users with 100+ tests

---

## Security Checklist

- [x] RLS policies on all tables
- [x] User can only access own data
- [x] API keys in environment variables (not code)
- [ ] Rate limiting (add if needed)
- [ ] Input sanitization (review forms)
- [ ] HTTPS only (automatic with Vercel)

---

## Success Metrics

Monitor these post-deployment:
- ✅ User sign-up completion rate
- ✅ Profile onboarding completion rate
- ✅ Blood test save success rate
- ✅ Database query performance (< 100ms)
- ✅ AI response time with context (< 3s)

---

## Support

For issues:
1. Check Supabase logs
2. Check Vercel deployment logs
3. Review browser console errors
4. Test with incognito mode (rule out cache)
