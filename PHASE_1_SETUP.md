# Phase 1: Project Setup - Execution Guide

## 📋 Phase 1 Checklist

### A. Create React Project
- [ ] Create new Vite React project
- [ ] Install all dependencies
- [ ] Clean up default files

### B. Configure Dependencies
- [ ] Install Firebase SDK
- [ ] Install React Router
- [ ] Install Tailwind CSS
- [ ] Install PostCSS

### C. Set Up Project Structure
- [ ] Create folder structure (components, pages, services, etc.)
- [ ] Create context providers (Auth, User)
- [ ] Create custom hooks
- [ ] Set up Firebase service file

### D. Configure Environment
- [ ] Create .env.local file
- [ ] Add Firebase credentials
- [ ] Set up environment variable loading

### E. Initialize Base Components
- [ ] Create App.jsx with routing
- [ ] Create Layout component
- [ ] Create basic Navbar
- [ ] Set up error boundary

### F. Test Setup
- [ ] Verify project runs locally
- [ ] Verify Firebase connection
- [ ] Verify Tailwind styling
- [ ] Verify routing works

---

## 🎯 Execution Steps

### Step 1: Create React Project with Vite
```bash
npm create vite@latest skillswap-react -- --template react
cd skillswap-react
npm install
```

### Step 2: Install Required Dependencies
```bash
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Remove Vanilla JS Files from Reference
- Keep old HTML/JS files in separate backup folder
- Start fresh with React structure

### Step 4: Configure Tailwind
Update `tailwind.config.js` with custom colors from original design

### Step 5: Create Firebase Service
Move Firebase initialization to `src/services/firebase.js`

### Step 6: Set Up Context for Auth
Create `src/context/AuthContext.jsx` for global auth state

### Step 7: Create Base Route Structure
Set up React Router in `App.jsx` with all page routes

### Step 8: Test Everything
- Run development server
- Test Firebase connection
- Verify all pages load

---

## 📦 Dependencies to Install

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.x
- firebase: ^10.7.1

### Development
- vite: ^5.x
- @vitejs/plugin-react: ^4.x
- tailwindcss: ^3.x
- postcss: ^8.x
- autoprefixer: ^10.x

### Optional (for future phases)
- zustand or redux for state management
- react-query for API management
- framer-motion for animations
- react-hook-form for form handling

---

## 🏗️ Initial File Structure (After Setup)
```
skillswap-react/
src/
├── App.jsx                    ← Main routing component
├── main.jsx                   ← Entry point
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Layout.jsx
│   │   └── Footer.jsx
│   ├── auth/
│   │   ├── ProtectedRoute.jsx
│   │   └── LoginForm.jsx
│   └── ...
├── pages/
│   ├── Home.jsx
│   ├── Signin.jsx
│   ├── Signup.jsx
│   ├── Profile.jsx
│   ├── Browse.jsx
│   ├── Chat.jsx
│   └── Requests.jsx
├── context/
│   ├── AuthContext.jsx
│   └── UserContext.jsx
├── services/
│   ├── firebase.js
│   ├── authService.js
│   └── userService.js
├── hooks/
│   └── useAuth.js
├── utils/
│   └── validation.js
└── styles/
    └── globals.css
```

---

## ⏱️ Estimated Time: 2-3 hours

---

## ✅ Phase 1 Complete When:
1. React project created and dependencies installed
2. Firebase connection verified
3. All routes render without errors
4. Tailwind CSS working correctly
5. Navbar and Layout components displaying
6. Development server runs smoothly on `http://localhost:5173`
