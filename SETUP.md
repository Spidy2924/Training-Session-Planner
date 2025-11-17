# Setup Guide - Training Session Planner

This guide will help you set up the Training Session Planner application from scratch.

## Prerequisites

1. **Node.js 20+**: Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/)

## Step-by-Step Setup

### 1. Install PostgreSQL

#### Windows
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Open PostgreSQL command line (psql) or use pgAdmin:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE training_planner;

-- Verify database was created
\l

-- Exit psql
\q
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/training_planner
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   CSRF_SECRET=your-super-secret-csrf-key-change-in-production
   ```

   Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Database Schema

```bash
# Push schema to database (creates all tables)
npm run db:push
```

You should see output indicating tables were created successfully.

### 6. Seed Database with Sample Data

```bash
npm run db:seed
```

This will create:
- 3 Courses (CS-101, MATH-201, PHY-101)
- 4 Subjects (PROG-101, CALC-201, MECH-101, ALGO-301)
- 3 Instructors
- 3 Platoons (PLT-A, PLT-B, PLT-C)
- 3 Users (1 admin, 2 platoon managers)
- 4 Sample sessions

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 8. Login

You'll be redirected to the login page. Use these credentials:

**Admin User:**
- Email: `admin@example.com`
- Password: `password123`

**Platoon A Manager:**
- Email: `platoon.a@example.com`
- Password: `password123`

**Platoon B Manager:**
- Email: `platoon.b@example.com`
- Password: `password123`

## Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Check your DATABASE_URL in `.env.local`
- Verify PostgreSQL is running: `pg_isready`
- Verify your password is correct

**Error: "database does not exist"**
- Create the database: `createdb training_planner`
- Or use psql: `CREATE DATABASE training_planner;`

**Error: "connection refused"**
- Check if PostgreSQL is running
- Windows: Check Services
- macOS/Linux: `sudo systemctl status postgresql`

### Port Already in Use

If port 3000 is already in use:
```bash
# Use a different port
PORT=3001 npm run dev
```

### Clear Database and Restart

If you need to reset everything:
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE training_planner;"
psql -U postgres -c "CREATE DATABASE training_planner;"

# Push schema and seed again
npm run db:push
npm run db:seed
```

## Optional: Use Drizzle Studio

To visually inspect your database:

```bash
npm run db:studio
```

This opens a web interface at [http://localhost:4983](http://localhost:4983) where you can view and edit data.

## Next Steps

1. **Explore the Dashboard**: Navigate to `/dashboard/sessions` after logging in
2. **Create a Session**: Click "Create Session" button
3. **Filter Sessions**: Use the filter controls to find specific sessions
4. **Bulk Upload**: Try uploading the `sample-sessions.csv` file
5. **Test Permissions**: Login as different users to see role-based access control

## Production Deployment

For production deployment:

1. Update environment variables with secure secrets
2. Use a production PostgreSQL database
3. Set `NODE_ENV=production`
4. Build the application: `npm run build`
5. Start production server: `npm start`

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check the database connection string format

