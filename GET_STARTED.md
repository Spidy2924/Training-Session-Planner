# 🚀 Get Started - Training Session Planner

Welcome! This document will help you get the Training Session Planner up and running quickly.

## 📋 What You Need

Before starting, make sure you have:
- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** installed and running ([Download](https://www.postgresql.org/download/))
- ✅ **PostgreSQL password** ready (you set this during installation)

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd my-app
npm install
```

### Step 2: Configure Database
1. Open `.env.local` file (already created in the project)
2. Update the `DATABASE_URL` with your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/training_planner
   ```
   Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### Step 3: Create Database
Open a terminal and run:
```bash
# Windows (PowerShell)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE training_planner;"

# macOS/Linux
psql -U postgres -c "CREATE DATABASE training_planner;"
```
Enter your PostgreSQL password when prompted.

### Step 4: Set Up Database Tables
```bash
npm run db:push
```

### Step 5: Add Sample Data
```bash
npm run db:seed
```

### Step 6: Start the Application
```bash
npm run dev
```

### Step 7: Open in Browser
1. Go to: **http://localhost:3000**
2. You'll be redirected to the login page
3. Login with:
   - **Email**: `admin@example.com`
   - **Password**: `password123`

## 🎉 You're Ready!

After logging in, you'll see the Training Sessions Dashboard where you can:
- ✅ View all training sessions
- ✅ Create new sessions
- ✅ Edit existing sessions
- ✅ Delete sessions
- ✅ Filter sessions by course, platoon, instructor, or date
- ✅ Bulk upload sessions from CSV/XLSX files

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup guide
- **[README.md](./README.md)** - Complete documentation
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Test all features
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Implementation overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

## 🧪 Try These Features

### 1. Create a Session
1. Click **"Create Session"** button
2. Fill in the form
3. Click **"Create Session"**
4. See your new session in the table

### 2. Filter Sessions
1. Use the filter dropdowns at the top
2. Select a course, platoon, or instructor
3. Set date range if needed
4. Click **"Reset Filters"** to clear

### 3. Bulk Upload
1. Click **"Bulk Upload"** button
2. Select the `sample-sessions.csv` file (included in project)
3. Preview the data
4. Click **"Upload"**
5. See the results (success/failed counts)

### 4. Test Different User Roles
Logout and login with different accounts:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@example.com | password123 | Admin | All sessions |
| platoon.a@example.com | password123 | Platoon Manager | PLT-A only |
| platoon.b@example.com | password123 | Platoon Manager | PLT-B only |

## 🔧 Troubleshooting

### "Can't connect to database"
- Make sure PostgreSQL is running
- Check your password in `.env.local`
- Verify database `training_planner` exists

### "Port 3000 already in use"
```bash
# Use a different port
PORT=3001 npm run dev
```

### "Seeding failed"
- Check DATABASE_URL in `.env.local`
- Make sure database exists
- Verify PostgreSQL is running

### Need to Reset Everything?
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE training_planner;"
psql -U postgres -c "CREATE DATABASE training_planner;"

# Set up again
npm run db:push
npm run db:seed
```

## 📊 What's Included

After setup, your database contains:
- **3 Users** (1 admin, 2 platoon managers)
- **3 Courses** (CS-101, MATH-201, PHY-101)
- **4 Subjects** (PROG-101, CALC-201, MECH-101, ALGO-301)
- **3 Instructors** (John Smith, Jane Doe, Robert Johnson)
- **3 Platoons** (PLT-A, PLT-B, PLT-C)
- **4 Sample Sessions**

## 🎯 Next Steps

1. ✅ Explore the dashboard
2. ✅ Create your own sessions
3. ✅ Try filtering and searching
4. ✅ Upload the sample CSV file
5. ✅ Test with different user roles
6. ✅ Read the full documentation

## 💡 Tips

- **Sample CSV**: Use `sample-sessions.csv` to test bulk upload
- **Drizzle Studio**: Run `npm run db:studio` to view database visually
- **API Testing**: Use tools like Postman to test API endpoints
- **Code Quality**: Run `npm run build` to check for TypeScript errors

## 🆘 Need Help?

1. Check the **[SETUP.md](./SETUP.md)** for detailed instructions
2. Review **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** to verify features
3. Check console logs for error messages
4. Verify all environment variables are set correctly

## ✨ Features Implemented

- ✅ **Authentication**: JWT-based with secure cookies
- ✅ **Authorization**: Role-based access control
- ✅ **CRUD Operations**: Full create, read, update, delete
- ✅ **Advanced Filtering**: Multi-criteria search
- ✅ **Bulk Upload**: CSV/XLSX support with error handling
- ✅ **Security**: CSRF protection, rate limiting, input validation
- ✅ **Modern UI**: Responsive design with Tailwind CSS
- ✅ **Type Safety**: Full TypeScript implementation

## 🎊 Enjoy!

You now have a fully functional Training Session Planner. Explore, experiment, and enjoy! 🚀

