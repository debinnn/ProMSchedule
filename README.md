# Team Schedule Manager MVP

A professional React-based team schedule management application with clean, minimal design.

## Features

- **Three View Modes**: Daily, Weekly, and Monthly schedule views
- **Access Levels**: 
  - Public (read-only)
  - Editor (can modify schedules)
  - Admin (manage users and schedules)
- **Shift Management**: JPN, IST, CET Early, and CET Late shifts
- **Slot System**: 6 time slots with 4-hour coverage blocks
- **On-Leave Tracking**: Track team members on leave
- **User Filtering**: Filter schedules by team member
- **Team Management**: Add, edit, activate/deactivate team members
- **User Management**: Admin can manage editor accounts

## Pre-populated Data

### Demo Accounts
- **Admin**: username: `admin`, password: `Admin@123`
- **Editor**: username: `manager`, password: `Manager@123`

### Team Members (13 pre-loaded)
1. Debin Robert
2. Ajin George
3. Nikita Nikita
4. Srikanth Koduru
5. Anurag Parashar Sarmah
6. Febin Bincy
7. Harikarthik K
8. Isha Arora
9. Lham Tsering
10. Melvin Joshva
11. Rakshita Ashwathanarayana
12. Shubhanshu Srivastava
13. Kristina Johansson

### Sample Schedule (January 19, 2026)
- **JPN Shift**: Febin Bincy (Slot 1, M1)
- **IST Shift**: Rakshita Ashwathanarayana (Slot 2, M2), Isha Arora (Slot 3, M3)
- **CET Late Shift**: Anurag Parashar Sarmah (Slot 5, M5)
- **On Leave**: Debin Robert (Training), Ajin George (Training)

## Installation & Setup

The application is ready to run. Just start it:

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Public Access (No Login)
- View all schedules in Daily/Weekly/Monthly views
- Filter by team member
- Read-only access

### Editor Access
1. Click "Login" button
2. Use credentials: `manager` / `Manager@123`
3. You can now:
   - Add members to shifts
   - Remove members from shifts
   - Add members to leave
   - Manage team members (add, edit, activate/deactivate)

### Admin Access
1. Click "Login" button
2. Use credentials: `admin` / `Admin@123`
3. Admin can do everything editors can, plus:
   - Manage editor user accounts
   - Create new editors
   - Reset passwords
   - Delete user accounts

## Shift Definitions

- **JPN Shift**: 05:30-14:30 IST (Available slots: 1, 2)
- **IST Shift**: 09:30-18:30 IST (Available slots: 2, 3, 4)
- **CET Early Shift**: 12:30-21:00 IST (Available slots: 3, 4, 5)
- **CET Late Shift**: 14:30-23:30 IST (Available slots: 4, 5, 6)

## Slot Definitions (4-hour blocks)

1. **Slot 1**: 05:30-09:30 IST (01:00-05:00 CET)
2. **Slot 2**: 09:30-13:30 IST (05:00-09:00 CET)
3. **Slot 3**: 13:30-17:30 IST (09:00-13:00 CET)
4. **Slot 4**: 17:30-21:30 IST (13:00-17:00 CET)
5. **Slot 5**: 21:30-01:30 IST (17:00-21:00 CET)
6. **Slot 6**: 01:30-05:30 IST (21:00-01:00 CET)

## Data Storage

All data is stored in browser localStorage under the key `teamScheduleData`. 

To reset all data:
```javascript
localStorage.removeItem('teamScheduleData');
// Refresh the page
```

## Navigation

### Routes
- `/` - Main schedule view
- `/team` - Team member management (requires editor/admin login)
- `/admin` - User account management (requires admin login)

### View Modes
- **Daily**: See detailed schedule for a single day
- **Weekly**: See schedule for 7 days (Monday-Sunday)
- **Monthly**: Calendar view with assignment counts

## Features in Detail

### Adding a Member to a Shift
1. Login as editor or admin
2. In daily view, click "+ Add Member" on any shift
3. Select member (only available members shown)
4. Select slot (only available slots shown, taken slots disabled)
5. Select or enter assignment (M1-M5 or custom)
6. Click Save

### Adding a Member to Leave
1. Login as editor or admin
2. Click "+ Add Member to Leave" in On Leave section
3. Select member (only those not already assigned)
4. Select or enter reason
5. Click Save

### Managing Team Members
1. Login as editor or admin
2. Click "Manage Team" in header
3. Add new members, edit names, or activate/deactivate members

### Managing Users (Admin Only)
1. Login as admin
2. Click "Manage Users" in header
3. Add new editors, reset passwords, or delete users

## Validation Rules

### Passwords
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Usernames
- Minimum 3 characters
- Alphanumeric only

### Member Names
- Minimum 2 characters

### Schedule Rules
- One slot can only be assigned to one person per shift per day
- Same slot number can be used by different shifts
- Members on leave cannot be assigned to any shift that day
- Once assigned or on leave, member cannot be added again for that day

## Design Philosophy

Clean, professional, minimal aesthetic:
- Flat colors (no gradients)
- Neutral color palette (whites, grays, subtle blues)
- Professional typography
- Ample whitespace
- Clear visual hierarchy
- Think Google Calendar / Linear / Notion level polish

## Technologies Used

- React 18
- React Router DOM (routing)
- date-fns (date manipulation)
- Tailwind CSS (styling)
- localStorage (data persistence)

## Browser Compatibility

Works in all modern browsers that support:
- ES6+
- localStorage
- CSS Grid/Flexbox

## Build for Production

To create a production build:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### Data not persisting?
- Check browser localStorage is enabled
- Check browser console for errors

### Login not working?
- Ensure you're using the correct credentials
- Check caps lock is off
- Admin: `admin` / `Admin@123`
- Editor: `manager` / `Manager@123`

### Can't add member to shift?
- Ensure member is not already assigned that day
- Ensure member is not on leave that day
- Ensure selected slot is available for that shift

---

Built with React • Designed for professional teams • January 2026

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
