# SkillSwap React - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm installed
- Firebase project set up (already configured)

### Step 1: Install Dependencies
```bash
cd skillswap-react
npm install
```

### Step 2: Configure Environment Variables
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local and add your Firebase credentials:
VITE_FIREBASE_API_KEY=AIzaSyBUMI6CgEVrnfsTVBXZx3uZDsBh5oUY-1w
VITE_FIREBASE_AUTH_DOMAIN=skill-swap-platform-53823.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skill-swap-platform-53823
VITE_FIREBASE_APP_ID=1:527524796826:web:8b7f50476ba72c8ebe0223
VITE_FIREBASE_DATABASE_URL=https://skill-swap-platform-53823-default-rtdb.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=skill-swap-platform-53823.appspot.com
```

### Step 3: Run Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Step 4: Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
skillswap-react/
├── src/
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   └── ProtectedRoute.jsx
│   │   └── common/            # Shared components
│   │       ├── Navbar.jsx
│   │       ├── Layout.jsx
│   │       └── Footer.jsx
│   ├── pages/                 # Page components (one per route)
│   │   ├── Home.jsx
│   │   ├── Signin.jsx
│   │   ├── Signup.jsx
│   │   ├── Profile.jsx
│   │   ├── Browse.jsx
│   │   ├── Chat.jsx
│   │   └── Requests.jsx
│   ├── context/               # React Context for state
│   │   └── AuthContext.jsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.js
│   ├── services/              # API & service functions
│   │   ├── firebase.js
│   │   └── authService.js
│   ├── styles/
│   │   └── globals.css
│   └── utils/                 # Utility functions
│       └── validation.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

---

## 🔑 Key Features Implemented in Phase 1

✅ **Firebase Integration**
- Authentication service configured
- Real-time database connection ready
- Storage service initialized

✅ **Authentication Context**
- Global auth state with AuthProvider
- Sign up, Sign in, Sign out functionality
- Protected routes for authenticated pages

✅ **Routing**
- React Router configured with 7 pages
- Protected route wrapper for private pages
- Proper navigation between pages

✅ **UI Components**
- Responsive Navbar with auth state
- Layout wrapper with gradient background
- Base page templates for all routes

✅ **Tailwind CSS**
- Custom color scheme (primary: #006064, accent: #FF7F50)
- Dark gradient background matching original design
- Responsive design from day one

---

## 📝 Available Routes

| Route | Component | Protected |
|-------|-----------|-----------|
| `/` | Home | No |
| `/signin` | Sign In | No |
| `/signup` | Sign Up | No |
| `/profile` | User Profile | Yes |
| `/browse` | Browse Skills | Yes |
| `/chat` | Chat System | Yes |
| `/requests` | View Requests | Yes |

---

## 🧪 Testing the Setup

### 1. Test Home Page
- Open http://localhost:5173
- Should see SkillSwap welcome message
- Navbar should show Sign In/Sign Up buttons

### 2. Test Sign Up
- Click "Sign Up" in navbar
- Fill in form and submit
- Should redirect to home on success
- Navbar should show Profile/Logout

### 3. Test Protected Routes
- After signing up, visit `/profile`
- Should load without issues
- Try accessing while not logged in (should redirect to signin)

### 4. Test Firebase Connection
- Check browser console (F12)
- Should see "Firebase persistence set to LOCAL"
- No errors should appear

---

## 🔧 Development Workflow

### Adding a New Page
1. Create component in `src/pages/`
2. Export component
3. Add route in `App.jsx`
4. Add navbar link if needed

### Adding a New Component
1. Create in appropriate folder under `src/components/`
2. Export as named export
3. Import and use in pages

### Adding State
1. Create context file in `src/context/` if global
2. Or use useState in component if local
3. Use custom hook from `src/hooks/` to access

---

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint (when configured)
```

---

## 🔐 Environment Variables

All variables should be prefixed with `VITE_` to be accessible in the app:

```javascript
import.meta.env.VITE_FIREBASE_API_KEY  // Access in code
```

Never commit `.env.local` - it contains secrets!

---

## ✨ Next Steps (Phase 2)

1. **Polish Authentication**
   - Add password reset functionality
   - Email verification
   - Error message improvements

2. **Profile Management**
   - User avatar upload
   - Profile information editing
   - User ratings/reviews

3. **Browse Skills**
   - Fetch and display all users
   - Filter by skills offered/wanted
   - User search

---

## 🐛 Troubleshooting

### Firebase Connection Error
- Check `.env.local` has correct credentials
- Verify Firebase project exists and is active
- Check browser console for detailed error

### Styling Not Applied
- Ensure tailwind content paths are correct in `tailwind.config.js`
- Clear build cache: `rm -rf node_modules/.vite`
- Restart dev server

### Components Not Rendering
- Check page is exported from `src/pages/`
- Verify route is added to `App.jsx`
- Check browser console for import errors

---

## 📞 Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for failed requests
3. Firebase console for auth/database issues
4. The comprehensive [CONVERSION_PLAN.md](./CONVERSION_PLAN.md)

---

## 📜 License

© 2026 SkillSwap Platform
