# RSVP App

A full-stack event management and RSVP tracking application. Create events, manage guest lists, send email invitations, and track RSVPs — all in one place.

## Features

- **Event Management** — Create, edit, and manage events with support for multiple occasion types (Birthday, Wedding, Corporate, and more)
- **Guest Management** — Add guests individually or import via CSV; support for plus-ones
- **RSVP Tracking** — Guests respond via a unique tokenized link (Yes / No / Maybe); track dietary preferences and messages
- **Email Invitations & Reminders** — Automated invitation emails and scheduled reminders powered by [Resend](https://resend.com) and React Email
- **Authentication** — Email/password login and Google OAuth 2.0 via Passport.js, with JWT access/refresh token rotation
- **Dashboard** — Overview of upcoming events and RSVP response statistics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State / Data | TanStack Query (React Query v5) |
| Routing | React Router DOM v6 |
| Backend | Node.js, Express, TypeScript |
| ORM / Database | Prisma, PostgreSQL |
| Auth | Passport.js (Local + Google OAuth), JWT |
| Email | Resend, React Email |
| Scheduling | node-cron |
| Package Manager | pnpm (workspaces) |

## Project Structure

```
automate-software-engineering/
└── rsvp-app/
    ├── client/          # React frontend (Vite)
    │   └── src/
    │       ├── components/
    │       ├── hooks/
    │       ├── lib/
    │       └── pages/
    ├── server/          # Express backend
    │   └── src/
    │       ├── config/
    │       ├── controllers/
    │       ├── emails/
    │       ├── jobs/
    │       ├── middleware/
    │       └── routes/
    └── package.json     # Root workspace package
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+
- [PostgreSQL](https://www.postgresql.org/) v14+

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/manmathw/automate-software-engineering.git
cd automate-software-engineering/rsvp-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI (e.g. `http://localhost:3001/api/auth/google/callback`) |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `EMAIL_FROM` | Sender address (e.g. `Your App <events@yourdomain.com>`) |
| `CLIENT_URL` | Frontend base URL (e.g. `http://localhost:5173`) |
| `SERVER_URL` | Backend base URL (e.g. `http://localhost:3001`) |
| `RSVP_BASE_URL` | Base URL for RSVP links (e.g. `http://localhost:5173/rsvp`) |
| `PORT` | Server port (default: `3001`) |
| `NODE_ENV` | `development` or `production` |
| `COOKIE_SECRET` | Secret for signing cookies (min 32 chars) |
| `CORS_ORIGIN` | Allowed CORS origin (e.g. `http://localhost:5173`) |

### 4. Set up the database

```bash
pnpm --filter server prisma:migrate
pnpm --filter server prisma:generate
```

### 5. Start the development servers

```bash
pnpm dev
```

This starts both the backend (port `3001`) and frontend (port `5173`) concurrently.

## API Overview

The backend exposes the following route groups:

| Prefix | Description |
|---|---|
| `GET /health` | Health check |
| `/api/auth` | Registration, login, logout, token refresh, Google OAuth |
| `/api/events` | Create, list, get, update, delete events |
| `/api/rsvp` | Guest RSVP submission via invitation token |

## Available Scripts

Run these from the `rsvp-app/` directory:

| Command | Description |
|---|---|
| `pnpm dev` | Start client and server in watch mode |
| `pnpm build` | Build server (TypeScript) and client (Vite) |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm --filter server prisma:migrate` | Run database migrations |
| `pnpm --filter server prisma:studio` | Open Prisma Studio |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch and open a pull request
