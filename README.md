# Training Session Planner

A full-stack training session management application built with Next.js 15, PostgreSQL, and Drizzle ORM.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin & Platoon-scoped users)
- **CRUD Operations**: Create, read, update, and delete training sessions
- **Advanced Filtering**: Filter sessions by course, platoon, instructor, and date range
- **Bulk Upload**: Upload sessions via CSV/XLSX files with preview and error reporting
- **Security**: CSRF protection, rate limiting, and secure authentication
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT with bcryptjs
- **File Parsing**: papaparse (CSV), xlsx (Excel)

## Prerequisites

- Node.js 20+
- PostgreSQL database

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/training_planner
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CSRF_SECRET=your-super-secret-csrf-key-change-in-production
```

### 3. Set Up Database

Make sure PostgreSQL is running, then:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding the database, you can log in with:

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `password123`
  - Can manage all sessions

- **Platoon A Manager**:
  - Email: `platoon.a@example.com`
  - Password: `password123`
  - Can only manage Platoon A sessions

- **Platoon B Manager**:
  - Email: `platoon.b@example.com`
  - Password: `password123`
  - Can only manage Platoon B sessions

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/v1/sessions` - List sessions (with filters)
- `POST /api/v1/sessions` - Create session
- `PATCH /api/v1/sessions/:id` - Update session
- `DELETE /api/v1/sessions/:id` - Delete session
- `POST /api/v1/sessions/bulk-upload` - Bulk upload sessions

### Reference Data
- `GET /api/v1/courses` - List courses
- `GET /api/v1/subjects` - List subjects
- `GET /api/v1/platoons` - List platoons
- `GET /api/v1/instructors` - List instructors

## Bulk Upload Format

### CSV Example

```csv
Course,Subject,Platoon,Instructor,Planned At,Duration (min),Venue,Notes
CS-101,PROG-101,PLT-A,john.smith@example.com,2025-11-25T09:00:00,90,Room 101,Introduction
MATH-201,CALC-201,PLT-B,jane.doe@example.com,2025-11-26T14:00:00,60,Room 305,Advanced topics
```

### Column Mapping (case-insensitive)
- **Course**: Course code or title
- **Subject**: Subject code or title
- **Platoon**: Platoon key or name
- **Instructor**: Instructor name or email
- **Planned At**: ISO datetime (YYYY-MM-DDTHH:mm:ss)
- **Duration (min)**: Number of minutes
- **Venue**: Venue name
- **Notes**: Optional notes

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **CSRF Protection**: All state-changing operations require CSRF token
3. **Rate Limiting**: Bulk upload endpoint is rate-limited (5 requests per minute)
4. **Role-Based Access Control**: Admin and platoon-scoped permissions
5. **Input Validation**: All inputs validated with Zod schemas

## Database Schema

- **users**: Authentication and authorization
- **courses**: Training courses
- **subjects**: Course subjects
- **instructors**: Training instructors
- **platoons**: Training platoons
- **sessions**: Training sessions (links all entities)

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database with sample data
```

## Project Structure

```
my-app/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   ├── login/         # Login page
│   └── layout.tsx     # Root layout
├── components/
│   ├── sessions/      # Session-related components
│   └── ui/            # UI components (shadcn/ui)
├── lib/
│   ├── auth/          # Authentication utilities
│   ├── db/            # Database schema and connection
│   └── validations/   # Zod schemas
└── public/            # Static assets
```
