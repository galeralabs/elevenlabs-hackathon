# TeaTime - Elderly Care Dashboard

A dashboard application for managing daily wellness calls to elderly people using 11 Labs conversational AI agents.

## Features

- **Dashboard**: Overview of elderly profiles, calls, and issues
- **Elderly Profiles**: Manage profiles with contact info, medical notes, and call preferences
- **Call History**: Track all calls with summaries and mood assessments
- **Issues Management**: Track problems and requests surfaced from calls

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State**: TanStack Query + React Router

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start Supabase locally:
```bash
supabase start
```

3. Apply migrations and seed data:
```bash
supabase db reset
```

4. Update `.env.local` with your Supabase credentials (already configured for local dev)

5. Start the dev server:
```bash
npm run dev
```

## Database Schema

- `elderly_profiles` - Core profiles with contact and care info
- `calls` - Call records linked to 11Labs conversations
- `call_transcripts` - Normalized transcript entries
- `call_summaries` - AI-generated summaries with mood/health analysis
- `issues` - Problems/requests surfaced from calls
- `schedule_overrides` - Skip/reschedule calls

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn components
│   ├── layout/      # Sidebar, Header, MainLayout
│   ├── elderly/     # Elderly-related components
│   ├── calls/       # Call-related components
│   └── issues/      # Issue-related components
├── pages/           # Route pages
├── hooks/           # React Query hooks
├── lib/             # Supabase client, utils
└── types/           # TypeScript types

supabase/
├── migrations/      # Database migrations
├── seed.sql         # Test data
└── functions/       # Edge functions (future)
```

## Next Steps (Edge Functions)

Edge functions for 11Labs integration will be added:
- `webhook-elevenlabs` - Receive post-call webhooks
- `initiate-call` - Trigger outbound calls
- `scheduled-calls` - Cron job for daily automated calls
