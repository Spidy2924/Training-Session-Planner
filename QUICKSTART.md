# Quick Start Guide

Get the Training Session Planner running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ PostgreSQL installed and running
- ✅ PostgreSQL password ready

## Quick Setup (5 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `.env.local` file (already created) with your PostgreSQL password:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/training_planner
```

### 3. Create Database
```bash
# Option A: Using psql
psql -U postgres -c "CREATE DATABASE training_planner;"

# Option B: Using createdb
createdb -U postgres training_planner
```

### 4. Setup Database Schema & Seed Data
```bash
npm run db:push
npm run db:seed
```

### 5. Start Application
```bash
npm run dev
```

## Access the Application

1. Open browser: http://localhost:3000
2. Login with:
   - Email: `admin@example.com`
   - Password: `password123`

## What's Included

After setup, you'll have:
- ✅ 3 Users (1 admin, 2 platoon managers)
- ✅ 3 Courses
- ✅ 4 Subjects
- ✅ 3 Instructors
- ✅ 3 Platoons
- ✅ 4 Sample training sessions

## Test Features

1. **View Sessions**: See all training sessions in the dashboard
2. **Create Session**: Click "Create Session" button
3. **Filter Sessions**: Use filters to search by course, platoon, date, etc.
4. **Bulk Upload**: Upload `sample-sessions.csv` file
5. **Edit/Delete**: Modify or remove sessions
6. **Role-Based Access**: Login as different users to test permissions

## Demo Accounts

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@example.com | password123 | Admin | All sessions |
| platoon.a@example.com | password123 | Platoon Manager | PLT-A only |
| platoon.b@example.com | password123 | Platoon Manager | PLT-B only |

## Common Issues

**Can't connect to database?**
- Check PostgreSQL is running
- Verify password in `.env.local`
- Ensure database `training_planner` exists

**Port 3000 already in use?**
```bash
PORT=3001 npm run dev
```

**Need to reset everything?**
```bash
psql -U postgres -c "DROP DATABASE training_planner;"
psql -U postgres -c "CREATE DATABASE training_planner;"
npm run db:push
npm run db:seed
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Read [SETUP.md](./SETUP.md) for detailed setup instructions
- Explore the API endpoints
- Try bulk uploading sessions
- Test different user roles

Enjoy using the Training Session Planner! 🚀

