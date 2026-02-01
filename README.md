# Inga Capoeira

A full-stack web application for the Inga Capoeira group, featuring public content and a private members-only area with authentication and member management.

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Docker](#docker)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [License](#license)

## About

This project is a Next.js web application built for the Inga Capoeira group. It includes:

- Public-facing pages with information about the group
- Member registration and authentication system
- Student management and tracking
- Video lessons organized by category
- Attendance system and calendar
- Instructor dashboard

## Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **Frontend:** React 19, TypeScript 5, Tailwind CSS 4
- **UI Components:** Radix UI, Class Variance Authority
- **Database:** PostgreSQL
- **Authentication:** Next Auth (beta)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/inga-capoeira.git
cd inga-capoeira
```

2. Install dependencies:
```bash
npm install
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5555/inga_capoeira
```

### Docker

Run the entire stack with Docker Compose:

```bash
docker compose up -d
```

This will start:
- **inga_app** - Next.js application on port 3000
- **inga_postgres** - PostgreSQL database on port 5555

To stop the containers:

```bash
docker compose down
```

To rebuild after code changes:

```bash
docker compose up -d --build
```

## Usage

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Run database migrations |

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components
│   └── ui/        # Reusable UI primitives
├── lib/           # Utilities (database, migrations)
└── types/         # TypeScript type definitions
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create user account |
| POST | `/api/login` | Authenticate user |
| GET | `/api/student?id={userId}` | Get student information |

## License

This project is private and proprietary to Inga Capoeira.
