

# Backend Integration Plan — ML Model Proxy Architecture

## Summary
Set up the backend infrastructure so the frontend can upload resumes, send them to your ML model APIs (once deployed), and store/display results. Since your ML models aren't deployed yet, we'll create the full pipeline with placeholder endpoints you can swap in later.

## Architecture

```text
User uploads resume (PDF/DOCX)
        │
        ▼
  Frontend → Supabase Storage (resumes bucket)
        │
        ▼
  Edge Function: analyze-resume
  (proxies to YOUR ML model API endpoints)
        │
        ▼
  Your ML Models (external, not yet deployed)
  - Recommended Path model
  - Skill Gap model
  - Learning Roadmap model
  - Why This Path model
        │
        ▼
  Results stored in DB → Dashboard reads from DB
```

## Database Schema

**profiles** — auto-created on signup via trigger
- `id` (uuid, FK → auth.users), `full_name`, `role`, `education`, timestamps

**resumes** — uploaded files
- `id`, `user_id` (FK), `file_name`, `file_path` (storage ref), `status` (pending/analyzed/failed), `created_at`

**analyses** — ML model results (one per resume)
- `id`, `user_id` (FK), `resume_id` (FK → resumes), `recommended_path` (jsonb), `skill_gap` (jsonb), `learning_plan` (jsonb), `explanation` (jsonb), `created_at`

RLS on all tables: users can only access their own rows.

## Edge Function: `analyze-resume`

- Accepts `{ resume_id, file_url }` (or reads the file from storage)
- Forwards the resume content to your ML model API URL (configured via a Supabase secret `ML_API_BASE_URL`)
- For now: returns mock data in the exact same shape as `mock-data.ts` so the UI works immediately
- Later: you replace the mock response with real HTTP calls to your 4 model endpoints
- Stores results in the `analyses` table
- Returns the analysis to the frontend

## Authentication
- Real Supabase auth on LoginPage (email/password signup & login)
- AuthContext with `onAuthStateChange` listener
- ProtectedRoute wrapper for `/upload`, `/dashboard`, `/profile`
- Password reset flow with `/reset-password` page

## Frontend Changes

1. **UploadPage** — real file upload to Supabase Storage, then calls edge function, stores result in context/DB
2. **DashboardPage** — fetches latest analysis from `analyses` table for logged-in user
3. **All 4 tab components** — read from analysis context (fallback to mock data if none)
4. **ProfilePage** — lists user's resumes and past analyses from DB
5. **App.tsx** — wrap with AuthProvider, protect routes

## Files to Create
- Migration SQL (profiles, resumes, analyses tables + RLS + trigger + storage bucket)
- `supabase/functions/analyze-resume/index.ts`
- `src/contexts/AuthContext.tsx`
- `src/contexts/AnalysisContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/ResetPasswordPage.tsx`

## Files to Modify
- `supabase/config.toml` — register edge function
- `LoginPage.tsx` — real auth
- `UploadPage.tsx` — real file upload + edge function call
- `DashboardPage.tsx` — fetch from DB
- `RecommendedPath.tsx`, `SkillGapAnalysis.tsx`, `LearningRoadmap.tsx`, `WhyThisPath.tsx` — read from context
- `ProfilePage.tsx` — fetch from DB
- `App.tsx` — AuthProvider, AnalysisProvider, protected routes

## ML Integration Point
The edge function will have a clearly marked section like:
```typescript
// TODO: Replace with your ML model API calls
// const pathResult = await fetch(`${ML_API_URL}/recommended-path`, { body: resumeText })
// const skillResult = await fetch(`${ML_API_URL}/skill-gap`, { body: resumeText })
// For now, returns mock data:
const analysis = getMockAnalysis();
```

When your models are deployed, you just update `ML_API_BASE_URL` secret and uncomment the real API calls.

