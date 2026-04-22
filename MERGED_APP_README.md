# Redeem App - Merged Admin & User Panel

## Project Structure
```
AdminPanel/ (Now: Redeem App)
├── src/
│   ├── pages/
│   │   ├── user/           # User Panel Pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── Rewards.jsx
│   │   │   ├── Redemptions.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── ShopSelection.jsx
│   │   │   └── ...
│   │   ├── LandingPage.jsx  # Entry point
│   │   ├── AdminLogin.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...              # Admin Pages
│   ├── components/
│   │   ├── BottomNav.jsx      # Admin Navigation
│   │   ├── UserBottomNav.jsx  # User Navigation
│   │   └── ...
│   └── App.jsx              # Unified routing
```

## Routes

### Landing
- `/` - Landing page with Admin/User selection

### Admin Routes (Prefix: `/admin`)
- `/admin/login` - Admin login
- `/admin/register` - Admin registration
- `/admin/dashboard` - Dashboard
- `/admin/users` - User management
- `/admin/bills` - Bills management
- `/admin/rewards` - Rewards management
- `/admin/redemptions` - Redemptions
- `/admin/notifications` - Notifications
- `/admin/plans` - Subscription plans
- `/admin/profile` - Admin profile
- `/admin/qr-code` - QR code generation

### User Routes (Prefix: `/user`)
- `/user/login` - User login (OTP-based)
- `/user/register` - User registration
- `/user/bills` - User bills & upload
- `/user/rewards` - Browse rewards
- `/user/redemptions` - Redemption history
- `/user/profile` - User profile
- `/user/notifications` - User notifications
- `/user/shop-selection` - Multi-shop selection

## Authentication
- **Admin**: Uses `adminToken` in localStorage
- **User**: Uses `userToken` in localStorage
- Separate protected routes for each panel

## Navigation
- **Admin**: 7-tab bottom navigation (Home, Users, Bills, Rewards, Notify, Plans, Profile)
- **User**: 5-tab bottom navigation (Bills, Rewards, Profile, Notify, Redeem)

## Features
- ✅ Unified landing page
- ✅ Separate authentication flows
- ✅ Independent navigation systems
- ✅ Shared components (PullToRefresh, IOSInstallPrompt)
- ✅ Subscription modal (Admin only)
- ✅ Notification badges (both panels)

## Development
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Notes
- User panel pages are in `src/pages/user/` directory
- Admin pages are in `src/pages/` root
- Both panels share the same API axios instance
- Landing page allows selection between Admin and User panels
