# Testing Checklist - Training Session Planner

Use this checklist to verify all features are working correctly.

## Prerequisites
- [ ] PostgreSQL is installed and running
- [ ] Database `training_planner` is created
- [ ] `.env.local` is configured with correct DATABASE_URL
- [ ] Dependencies are installed (`npm install`)
- [ ] Database schema is pushed (`npm run db:push`)
- [ ] Database is seeded (`npm run db:seed`)
- [ ] Development server is running (`npm run dev`)

## 1. Authentication Tests

### Login
- [ ] Navigate to http://localhost:3000
- [ ] Should redirect to `/login` page
- [ ] Login page displays demo credentials
- [ ] Login with `admin@example.com` / `password123` succeeds
- [ ] Redirects to `/dashboard/sessions` after login
- [ ] Header shows "Welcome, Admin User (admin)"

### Logout
- [ ] Click "Logout" button
- [ ] Redirects to `/login` page
- [ ] Cannot access `/dashboard/sessions` without logging in

### Different User Roles
- [ ] Login as `platoon.a@example.com` / `password123`
- [ ] Header shows "Welcome, Platoon A Manager (platoon_scoped)"
- [ ] Login as `platoon.b@example.com` / `password123`
- [ ] Header shows "Welcome, Platoon B Manager (platoon_scoped)"

## 2. Sessions List Tests

### View Sessions
- [ ] Login as admin
- [ ] Dashboard displays sessions table
- [ ] Table shows columns: Course, Subject, Platoon, Instructor, Planned At, Duration, Venue, Notes, Actions
- [ ] At least 4 sample sessions are visible
- [ ] Each row has Edit and Delete buttons

### Pagination/Scrolling
- [ ] Table is scrollable if many sessions exist
- [ ] All data is readable

## 3. Filter Tests

### Course Filter
- [ ] Select "CS-101" from Course dropdown
- [ ] Only CS-101 sessions are displayed
- [ ] Clear filter shows all sessions again

### Platoon Filter
- [ ] Select "PLT-A" from Platoon dropdown
- [ ] Only PLT-A sessions are displayed
- [ ] Clear filter shows all sessions again

### Instructor Filter
- [ ] Select an instructor from dropdown
- [ ] Only sessions with that instructor are displayed
- [ ] Clear filter shows all sessions again

### Date Range Filter
- [ ] Set "Start Date" to a past date
- [ ] Set "End Date" to a future date
- [ ] Sessions within range are displayed
- [ ] Clear filters shows all sessions

### Combined Filters
- [ ] Apply multiple filters simultaneously
- [ ] Results match all filter criteria
- [ ] Reset Filters button clears all filters

## 4. Create Session Tests

### Valid Session Creation
- [ ] Click "Create Session" button
- [ ] Dialog opens with form
- [ ] Fill all required fields:
  - Course: Select any course
  - Subject: Select any subject
  - Platoon: Select any platoon
  - Instructor: Select any instructor
  - Planned At: Select future date/time
  - Duration: Enter 60
  - Venue: Enter "Test Room"
  - Notes: Enter "Test notes"
- [ ] Click "Create Session"
- [ ] Success message or page reload
- [ ] New session appears in table

### Validation
- [ ] Try to submit form with empty required fields
- [ ] Form validation prevents submission
- [ ] Error messages are displayed

### Cancel
- [ ] Click "Create Session"
- [ ] Click "Cancel" button
- [ ] Dialog closes without creating session

## 5. Edit Session Tests

### Edit Existing Session
- [ ] Click "Edit" button on any session
- [ ] Dialog opens with pre-filled form
- [ ] All fields show current values
- [ ] Change venue to "Updated Room"
- [ ] Click "Update Session"
- [ ] Session updates successfully
- [ ] Table shows updated venue

### Cancel Edit
- [ ] Click "Edit" on a session
- [ ] Make changes
- [ ] Click "Cancel"
- [ ] Changes are not saved

## 6. Delete Session Tests

### Delete Session
- [ ] Click "Delete" button on any session
- [ ] Confirm deletion (if confirmation dialog exists)
- [ ] Session is removed from table
- [ ] Page reloads or updates

## 7. Bulk Upload Tests

### CSV Upload - Valid File
- [ ] Click "Bulk Upload" button
- [ ] Dialog opens
- [ ] Select `sample-sessions.csv` file
- [ ] Preview shows first 5 rows
- [ ] Click "Upload"
- [ ] Success message shows count of created sessions
- [ ] Error count is 0 or minimal
- [ ] Close dialog
- [ ] New sessions appear in table

### CSV Upload - Invalid File
- [ ] Create a CSV with invalid data (e.g., non-existent course)
- [ ] Upload the file
- [ ] Error messages are displayed
- [ ] Failed count is shown
- [ ] Error details list specific issues

### XLSX Upload
- [ ] Create or use an XLSX file with session data
- [ ] Upload the file
- [ ] Sessions are created successfully
- [ ] Preview may show "XLSX file selected"

### Sample Format Display
- [ ] Bulk upload dialog shows sample CSV format
- [ ] Format is clear and helpful

## 8. Authorization Tests

### Admin Access
- [ ] Login as `admin@example.com`
- [ ] Can view all sessions (PLT-A, PLT-B, PLT-C)
- [ ] Can edit any session
- [ ] Can delete any session
- [ ] Can create sessions for any platoon

### Platoon-Scoped Access
- [ ] Login as `platoon.a@example.com`
- [ ] Can view all sessions (or only PLT-A sessions depending on implementation)
- [ ] Try to edit a PLT-B session
- [ ] Should get permission error or not see edit option
- [ ] Can only create sessions for PLT-A

### Platoon B Manager
- [ ] Login as `platoon.b@example.com`
- [ ] Can manage PLT-B sessions
- [ ] Cannot modify PLT-A or PLT-C sessions

## 9. Security Tests

### CSRF Protection
- [ ] Open browser DevTools > Network tab
- [ ] Create a session
- [ ] Check request headers include `X-CSRF-Token`
- [ ] Token is present and valid

### Rate Limiting
- [ ] Upload a CSV file
- [ ] Immediately try to upload again 5+ times
- [ ] After 5 uploads in 60 seconds, should get rate limit error
- [ ] Wait 60 seconds, can upload again

### JWT Token
- [ ] Login successfully
- [ ] Check browser cookies (DevTools > Application > Cookies)
- [ ] `token` cookie exists
- [ ] Cookie is HttpOnly (cannot be accessed via JavaScript)

## 10. UI/UX Tests

### Responsive Design
- [ ] Resize browser window to mobile size
- [ ] Layout adapts to smaller screen
- [ ] All buttons are accessible
- [ ] Table is scrollable horizontally if needed

### Loading States
- [ ] Observe loading indicators during:
  - Login
  - Fetching sessions
  - Creating session
  - Uploading file
- [ ] Loading states are clear

### Error Messages
- [ ] Trigger various errors (invalid login, network error, etc.)
- [ ] Error messages are clear and helpful
- [ ] Errors are displayed in appropriate locations

## 11. Edge Cases

### Empty States
- [ ] Delete all sessions
- [ ] Table shows empty state or "No sessions found"
- [ ] Filters still work

### Long Text
- [ ] Create session with very long notes (500+ characters)
- [ ] Text is displayed properly (truncated or scrollable)

### Special Characters
- [ ] Create session with special characters in venue/notes
- [ ] Characters are properly escaped and displayed

### Date Boundaries
- [ ] Create session with date far in future (e.g., 2030)
- [ ] Create session with date in past
- [ ] Both are handled correctly

## 12. Performance Tests

### Large Dataset
- [ ] Upload CSV with 50+ sessions
- [ ] Table loads without significant delay
- [ ] Filtering remains responsive

### Concurrent Users (Manual)
- [ ] Open app in two different browsers
- [ ] Login as different users
- [ ] Both can work simultaneously
- [ ] Changes by one user don't break other user's session

## Summary

Total Tests: ~80+

After completing this checklist:
- [ ] All critical features work
- [ ] No major bugs found
- [ ] Application is ready for demo/submission

## Notes

Record any issues found:
- Issue 1: _______________
- Issue 2: _______________
- Issue 3: _______________

## Next Steps

If all tests pass:
1. ✅ Application is complete and functional
2. ✅ Ready for demonstration
3. ✅ Ready for code review
4. ✅ Ready for deployment (after production configuration)

