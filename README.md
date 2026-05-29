# ClipForge

AI-powered SaaS that converts long YouTube videos into viral short-form clips.

## Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Custom JWT (jose) + bcrypt
- **AI**: OpenAI Whisper (transcription) + GPT-4o-mini (clip detection)
- **Video**: yt-dlp + ffmpeg
- **Payments**: Paystack (subscriptions)
- **Deployment**: Vercel (app) + Railway (recommended for processing)

---

## Local Setup

### 1. Prerequisites

Install system dependencies:

```bash
# macOS
brew install ffmpeg yt-dlp postgresql

# Ubuntu/Debian
sudo apt install ffmpeg postgresql
pip install yt-dlp
```

### 2. Clone & Install

```bash
git clone <your-repo>
cd clipforge
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clipforge"
JWT_SECRET="generate-with: openssl rand -hex 32"
OPENAI_API_KEY="sk-..."
PAYSTACK_SECRET="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."
PAYSTACK_PLAN_CODE="PLN_..."        # Create a plan in Paystack dashboard
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ADMIN_EMAIL="your@email.com"
UPLOAD_DIR="/tmp/clipforge"
```

### 4. Database

```bash
# Create the database
createdb clipforge

# Push schema
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Paystack Setup

1. Log in to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Products → Subscriptions → Plans**
3. Create a plan:
   - Name: "ClipForge Pro"
   - Amount: ₦5,000
   - Interval: Monthly
4. Copy the `Plan Code` (e.g. `PLN_xxxx`) → set as `PAYSTACK_PLAN_CODE`
5. Copy your **Secret Key** → set as `PAYSTACK_SECRET`

### Webhook Setup

1. In Paystack dashboard → **Settings → API Keys & Webhooks**
2. Set webhook URL: `https://your-domain.com/api/paystack/webhook`
3. Enable events: `charge.success`, `subscription.disable`, `invoice.payment_failed`

---

## Deployment

### Vercel (Frontend + API)

```bash
npm install -g vercel
vercel

# Set all environment variables in Vercel dashboard
# Settings → Environment Variables
```

> **Note**: Vercel functions have a 10s timeout on Hobby and 60s on Pro. For long video processing, deploy to Railway and set `NEXT_PUBLIC_PROCESSING_URL` to your Railway URL.

### Railway (Recommended for Processing)

Railway supports long-running Node.js processes with no timeout.

1. Connect your GitHub repo to Railway
2. Add a service → Deploy from repo
3. Set all environment variables
4. Railway auto-detects Next.js — no config needed
5. Add a PostgreSQL database service in Railway → copy the `DATABASE_URL`

```bash
# railway.json (already handled by nixpacks)
# Railway will install ffmpeg and yt-dlp via nixpacks
```

Add a `nixpacks.toml` at project root for Railway:

```toml
[phases.setup]
nixPkgs = ["ffmpeg", "python311Packages.yt-dlp"]
```

### Environment Variables on Railway

Set the same variables as `.env.example` in the Railway dashboard.
Set `UPLOAD_DIR="/app/uploads"` (Railway has persistent disk).

---

## Admin Access

Set `ADMIN_EMAIL` to your email in `.env`.
When you sign up with that email, you'll automatically get admin access.
Admin panel: `/admin`

---

## Project Structure

```
/app
  /dashboard          - User dashboard (submit URLs, view clips)
  /admin              - Admin panel (users, videos, analytics)
  /api                - All API routes
  /(auth)/login       - Login page
  /(auth)/signup      - Signup page
/lib
  prisma.ts           - Prisma client singleton
  auth.ts             - JWT auth helpers
  ai.ts               - OpenAI Whisper + GPT helpers
  usage.ts            - Usage tracking + limit enforcement
  video.ts            - Video DB queries
/services
  download.ts         - yt-dlp + ffmpeg audio extraction
  clip.ts             - ffmpeg clip rendering (9:16)
  process.ts          - Full pipeline orchestrator
/components
  VideoCard.tsx       - Video status card
  ClipCard.tsx        - Clip with hook + download
  ProcessingStatus.tsx - Live processing progress
/prisma
  schema.prisma       - DB schema
```

---

## Plans & Limits

| Feature             | Free         | Pro (₦5k/mo) |
|---------------------|--------------|---------------|
| Videos/month        | 2            | 30            |
| Max video duration  | 5 min        | Unlimited     |
| Clips per video     | 3–5          | 3–5           |
| Export format       | 9:16 vertical | 9:16 vertical |
