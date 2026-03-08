# e-yar - AI App Builder

A professional AI-powered application builder for warehouse management systems. Built with Next.js, NextAuth.js, and Tailwind CSS.

## Features

- Professional landing page with login
- NextAuth.js authentication (demo: dan/dan)
- Protected dashboard workspace
- Admin panel for user management
- GitHub integration (coming soon)
- AI code generation (coming soon)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

### Login Credentials

- Username: `dan`
- Password: `dan`
- Role: admin

## Project Structure

```
/app              - Next.js App Router pages and routes
/components       - React components (UI, admin, dashboard, etc.)
/lib              - Utility functions and configuration (auth, users)
/types            - TypeScript type definitions
/public           - Static assets
```

## Tech Stack

- **Framework**: Next.js 15
- **Auth**: NextAuth.js v4
- **Database**: In-memory (replace with real DB)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript

## Development

### Environment Variables

The following env vars are configured in `.env.local`:

```
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Authentication Flow

1. User visits landing page or clicks login
2. Enters credentials (dan/dan for demo)
3. NextAuth validates against in-memory user store
4. Session created, user redirected to dashboard
5. Admin users can access `/dashboard/admin` for user management

## Next Steps

1. Connect real GitHub API for repository management
2. Implement AI code generation with OpenAI/Claude
3. Add file system integration for pulled repositories
4. Implement real database persistence
5. Add warehouse management system-specific features

