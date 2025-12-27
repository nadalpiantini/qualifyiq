# QualifyIQ

Lead qualification SaaS using BANT methodology with AI-assisted scoring.

## Overview

QualifyIQ helps sales teams qualify leads systematically using the BANT framework:
- **B**udget: Can they afford the solution?
- **A**uthority: Are we talking to the decision maker?
- **N**eed: Do they have a genuine business need?
- **T**imeline: Is there urgency to solve the problem?

Plus **Technical Fit** scoring and red flag detection for comprehensive lead evaluation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Features

- Interactive scorecard wizard for BANT + Technical Fit
- Lead management with filtering and search
- Dashboard with metrics and recent activity
- Customizable scoring weights per organization
- Red flag detection system
- Outcome tracking for feedback loop optimization

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/nadalpiantini/qualifyiq.git
cd qualifyiq

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://nqzhxukuvmdlpewqytpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database

Tables are prefixed with `qualifyiq_` (sujeto10 convention):

- `qualifyiq_organizations` - Multi-tenant organization data
- `qualifyiq_profiles` - User profiles linked to auth
- `qualifyiq_leads` - Lead information and status
- `qualifyiq_scorecards` - BANT scoring records
- `qualifyiq_scoring_configs` - Per-org scoring configuration

Run migrations in Supabase SQL Editor:
```sql
-- Copy contents of supabase/migrations/20250101000000_initial_schema.sql
```

## Deployment

Deployed to Vercel at [qualifyiq.sujeto10.com](https://qualifyiq.sujeto10.com)

```bash
vercel deploy --prod
```

## License

Private - All rights reserved
