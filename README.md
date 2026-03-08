# Personal AI Chief of Staff

AI-powered meeting preparation assistant. Sign in with Google, see your upcoming calendar meetings, and generate structured AI briefings — with context pulled from your emails.

## Features

- **Google OAuth login** — sign in with your Google account
- **Calendar sync** — fetches upcoming meetings (next 24 hours) from Google Calendar
- **Gmail context** — pulls related email threads with meeting participants
- **AI briefings** — generates structured meeting briefs using Groq (llama-3.3-70b-versatile)
- **PostgreSQL persistence** — stores users, meetings, and generated briefs

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon Serverless)
- **APIs:** Google Calendar, Gmail, Groq

---

## Prerequisites

1. **Node.js** 18+ and npm
2. **PostgreSQL** (e.g., Neon Serverless Postgres)
3. **Google Cloud Project** with OAuth 2.0 credentials
4. **Groq API key**

---

## Setup Instructions

### 1. Clone & Install

```bash
cd Chief
npm install
```

### 2. Set Up PostgreSQL

Create a database:

```sql
CREATE DATABASE chiefofstaff;
```

Run the schema:

```bash
psql -d chiefofstaff -f src/lib/schema.sql
```

### 3. Set Up Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Google Calendar API** and **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type** to "Web application"
6. Add **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=any-random-string-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/chiefofstaff
OPENAI_API_KEY=sk-your-openai-api-key
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable              | Description                                    |
|-----------------------|------------------------------------------------|
| `GOOGLE_CLIENT_ID`    | Google OAuth 2.0 Client ID                     |
| `GOOGLE_CLIENT_SECRET`| Google OAuth 2.0 Client Secret                 |
| `NEXTAUTH_SECRET`     | Random string for NextAuth session encryption  |
| `NEXTAUTH_URL`        | App URL (use `http://localhost:3000` for local) |
| `DATABASE_URL`        | PostgreSQL connection string                   |
| `OPENAI_API_KEY`      | OpenAI API key                                 |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js   # Google OAuth
│   │   ├── meetings/route.js             # Calendar sync
│   │   ├── briefs/
│   │   │   ├── generate/route.js         # AI brief generation
│   │   │   └── [meetingId]/route.js       # Get existing brief
│   ├── dashboard/page.js                 # Main dashboard
│   ├── layout.js                         # Root layout
│   ├── page.js                           # Login page
│   └── globals.css                       # Tailwind + custom CSS
├── components/
│   ├── AuthProvider.jsx                  # Session provider
│   ├── BriefCard.jsx                     # AI brief display
│   ├── MeetingCard.jsx                   # Meeting card w/ generate button
│   └── Navbar.jsx                        # Top navigation
└── lib/
    ├── ai/generate-brief.js              # OpenAI integration
    ├── google/calendar.js                # Google Calendar API
    ├── google/gmail.js                   # Gmail API
    ├── auth.js                           # Auth helpers
    ├── db.js                             # PostgreSQL connection
    └── schema.sql                        # Database schema
```
