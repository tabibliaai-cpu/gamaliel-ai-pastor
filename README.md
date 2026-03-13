# Gamaliel AI Pastor

> A full-stack, production-ready AI Pastoral Chatbot grounded in Scripture. Users sign up, ask biblical questions, and receive contextually accurate, multilingual responses. Built for scale (2000+ concurrent users) on a serverless-first stack.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Authentication Flow](#authentication-flow)
8. [Rate Limiting & Tiers](#rate-limiting--tiers)
9. [Billing (Stripe)](#billing-stripe)
10. [Internationalization](#internationalization)
11. [Deployment Guide (Railway)](#deployment-guide-railway)
12. [Local Development](#local-development)

---

## Architecture Overview

```
 Browser
   |
   v
 Next.js App (Railway - auto-scales)
   |-- /app/page.tsx          Landing page
   |-- /app/auth/page.tsx     Login / Sign up (Supabase Auth + OAuth)
   |-- /app/chat/page.tsx     Chat UI (ChatGPT-style)
   |-- /app/dashboard/page.tsx User dashboard + billing
   |
   |-- /app/api/chat/         Core AI endpoint
   |-- /app/api/usage/        Daily usage stats
   |-- /app/api/billing/      Stripe checkout + webhook
   |
   v
Supabase (Auth + Postgres + RLS)
   |-- auth.users             Managed by Supabase
   |-- public.users           Tier, Stripe customer ID
   |-- public.usage_logs      Per-message tracking
   |
   v
LLM Provider (OpenAI / Groq / any OpenAI-compatible)
   |-- Chat completions API
   |-- System prompt: Bible-focused Pastor persona
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|--------|
| Frontend | Next.js 14 (App Router) | SSR + React UI |
| Styling | Tailwind CSS | Utility-first, dark/light mode |
| Auth | Supabase Auth | Email, Google, GitHub OAuth |
| Database | Supabase Postgres | User data, usage logs |
| ORM/Client | Supabase JS SDK | Type-safe DB access |
| AI/LLM | OpenAI-compatible API | Chat completions |
| Payments | Stripe | Subscription billing |
| Deployment | Railway | Auto-scaling containers |
| Language | TypeScript | Type safety throughout |

---

## Project Structure

```
gamaliel-ai-pastor/
|-- app/
|   |-- page.tsx                  # Landing page
|   |-- auth/page.tsx             # Login + registration
|   |-- chat/page.tsx             # Main chat interface
|   |-- dashboard/page.tsx        # User profile + billing
|   |-- globals.css               # Global Tailwind base
|   |-- layout.tsx                # Root layout (ThemeProvider)
|   `-- api/
|       |-- chat/route.ts         # POST /api/chat
|       |-- usage/route.ts        # GET  /api/usage
|       `-- billing/
|           |-- create-checkout/route.ts  # POST /api/billing/create-checkout
|           `-- webhook/route.ts          # POST /api/billing/webhook
|-- lib/
|   |-- supabaseAdmin.ts          # Supabase service-role client
|   |-- llm.ts                    # LLM API wrapper
|   |-- usage.ts                  # Usage check + log helpers
|   `-- i18n.ts                   # Language name resolution
|-- docs/
|   `-- db-schema.sql             # Full Supabase SQL schema
|-- .env.example                  # Environment variable template
|-- package.json
|-- next.config.mjs
|-- tailwind.config.ts
`-- tsconfig.json
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values.

| Variable | Description |
|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `LLM_API_BASE_URL` | Base URL of LLM provider (OpenAI-compatible) |
| `LLM_API_KEY` | API key for LLM provider |
| `LLM_MODEL_NAME` | Model name, e.g. `gpt-3.5-turbo` or `llama3-70b-8192` |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe recurring Price ID for Pro plan |
| `NEXT_PUBLIC_APP_URL` | Full app URL (used in Stripe redirects) |

---

## Database Schema

Full SQL is in `docs/db-schema.sql`. Run it in **Supabase Dashboard > SQL Editor**.

### Tables

#### `public.users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | FK to `auth.users.id` |
| `email` | text | |
| `full_name` | text | Populated from OAuth metadata |
| `avatar_url` | text | |
| `tier` | text | `'free'` or `'paid'` |
| `stripe_customer_id` | text | Set on successful checkout |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `public.usage_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `public.users.id` |
| `message_preview` | text | First 100 chars of user message |
| `language_code` | text | e.g. `'hi'`, `'ta'`, `'en'` |
| `created_at` | timestamptz | Used for daily window queries |

### Row Level Security (RLS)
- Users can only **read** their own rows in both tables.
- API routes use the **service role key** (`supabaseAdmin`) to bypass RLS for writes.

### Auto-create trigger
A Postgres trigger `on_auth_user_created` fires on every new sign-up and upserts a row into `public.users` with email and name from OAuth metadata.

---

## API Reference

### `POST /api/chat`

Sends a user message and returns an AI response. Checks and logs usage.

**Auth:** Requires valid Supabase session cookie.

**Request body:**
```json
{
  "message": "What does the Bible say about forgiveness?",
  "language": "hi",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response (200):**
```json
{ "reply": "The Bible teaches that forgiveness is..." }
```

**Response (429):**
```json
{ "error": "Daily message limit reached. Upgrade to Pro for more." }
```

---

### `GET /api/usage`

Returns current-day usage for the logged-in user.

**Response (200):**
```json
{ "used": 3, "limit": 10, "tier": "free" }
```

---

### `POST /api/billing/create-checkout`

Creates a Stripe Checkout session and returns a redirect URL.

**Response (200):**
```json
{ "url": "https://checkout.stripe.com/..." }
```

---

### `POST /api/billing/webhook`

Stripe webhook endpoint. Handles:
- `checkout.session.completed` -> upgrades user to `paid`
- `customer.subscription.deleted` -> downgrades user to `free`

**Headers required:** `stripe-signature`

---

## Authentication Flow

1. User visits `/auth` page.
2. Chooses **Email/Password**, **Google**, or **GitHub** login.
3. Supabase Auth handles the OAuth redirect and session cookie.
4. On successful login, the Postgres trigger auto-creates a `public.users` row.
5. User is redirected to `/chat`.
6. All API routes validate the session using `createRouteHandlerClient`.

---

## Rate Limiting & Tiers

| Tier | Daily Limit | Price |
|------|-------------|-------|
| Free | 10 messages/day | $0 |
| Pro  | 500 messages/day | $9/month |

**Implementation:** `lib/usage.ts`
- `checkAndLogUsage(userId)` - Counts today's messages for the user, returns `{ allowed: boolean }`.
- If `allowed === false`, `/api/chat` returns HTTP 429.
- On allowed message, inserts a row into `usage_logs`.
- Daily window: UTC midnight to midnight using `created_at` range query.

---

## Billing (Stripe)

1. User clicks **Upgrade to Pro** on the dashboard.
2. Frontend calls `POST /api/billing/create-checkout`.
3. Server creates a Stripe Checkout Session with `userId` in metadata.
4. User completes payment on Stripe-hosted page.
5. Stripe fires `checkout.session.completed` webhook to `/api/billing/webhook`.
6. Webhook handler updates `users.tier = 'paid'` and stores `stripe_customer_id`.
7. On subscription cancellation, `customer.subscription.deleted` fires and resets tier to `free`.

**Webhook setup:** In Stripe Dashboard > Webhooks, add your Railway URL:
```
https://your-app.railway.app/api/billing/webhook
```
Events to listen for:
- `checkout.session.completed`
- `customer.subscription.deleted`

---

## Internationalization

The app supports **20 languages** including all major Indian languages:

| Code | Language | Code | Language |
|------|----------|----|----------|
| `en` | English | `hi` | Hindi |
| `ta` | Tamil | `te` | Telugu |
| `kn` | Kannada | `ml` | Malayalam |
| `mr` | Marathi | `gu` | Gujarati |
| `pa` | Punjabi | `bn` | Bengali |
| `or` | Odia | `as` | Assamese |
| `ur` | Urdu | `es` | Spanish |
| `fr` | French | `de` | German |
| `zh` | Chinese | `ar` | Arabic |
| `pt` | Portuguese | `ru` | Russian |

**How it works:** `lib/i18n.ts` provides `getLanguageName(code)`. The `/api/chat` route instructs the LLM to translate its response via the system prompt when language != English.

---

## Deployment Guide (Railway)

### Prerequisites
- [Railway account](https://railway.app)
- GitHub repo connected
- Supabase project created + schema applied
- Stripe account with a Product + Price created

### Steps

1. **Push code to GitHub** (this repo).

2. **Create Railway project:**
   - Go to [railway.app](https://railway.app) > New Project > Deploy from GitHub
   - Select `tabibliaai-cpu/gamaliel-ai-pastor`

3. **Add environment variables** in Railway Dashboard > Variables:
   - Copy all values from `.env.example` with real credentials

4. **Set build command** (Railway auto-detects Next.js):
   - Build: `npm run build`
   - Start: `npm start`

5. **Configure custom domain** (optional):
   - Railway Dashboard > Settings > Domains > Add Custom Domain

6. **Configure Stripe webhook:**
   - Stripe Dashboard > Webhooks > Add endpoint
   - URL: `https://your-app.up.railway.app/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

7. **Configure Supabase OAuth** (Google/GitHub):
   - Supabase Dashboard > Auth > Providers
   - Enable Google + GitHub, add your Railway URL to allowed redirect URLs

### Auto-scaling
Railway automatically scales containers horizontally based on traffic. For 2000+ users, the default plan handles it. Next.js API routes are serverless-friendly - each request is stateless.

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/tabibliaai-cpu/gamaliel-ai-pastor.git
cd gamaliel-ai-pastor

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase, LLM, and Stripe credentials

# 4. Apply database schema
# Go to Supabase Dashboard > SQL Editor
# Paste and run the contents of docs/db-schema.sql

# 5. Start development server
npm run dev

# App runs at http://localhost:3000
```

### Supabase Auth Redirect URL for local dev
In Supabase Dashboard > Auth > URL Configuration, add:
```
http://localhost:3000/auth/callback
```

---

## Contributing

PRs welcome. Please open an issue first for major changes.

---

## License

MIT
