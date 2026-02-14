# SkillSwap React - Setup & Installation Guide

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Git**: For version control
- **Firebase Account**: For backend services

## Step 1: Clone or Extract the Project

```bash
cd skillswap-react
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages specified in `package.json`:
- React 18.2 
- Vite 5.0
- Firebase 10.7.1
- React Router v6.20
- Tailwind CSS 3.4

## Step 3: Configure Firebase

### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name it "SkillSwap" (or your preferred name)
4. Enable Google Analytics (optional)

### 3.2 Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication method
4. Click "Enable" and then "Save"

### 3.3 Create Realtime Database

1. Go to **Build** → **Realtime Database**
2. Click "Create Database"
3. Choose your region (closest to your users)
4. Start in **Test Mode** (for development)
   - ⚠️ **Important**: Before production, change to locked mode and add proper security rules

### 3.4 Get Firebase Config

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll to "Your apps" section
3. If no app exists, click "Add app" and select "Web" (</> icon)
4. Copy the config object

### 3.5 Create `.env.local` File

Create a `.env.local` file in the project root and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace all values with your Firebase project credentials.

## Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 5: Create Test Accounts

1. Go to `http://localhost:5173/signup`
2. Create 2-3 test accounts with different skills
3. Use emails like:
   - alice@example.com (wants to learn JavaScript, teaches Python)
   - bob@example.com (wants to learn Python, teaches React)
   - carol@example.com (wants to learn React, teaches TypeScript)

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Format code with Prettier
npm run format

# Lint code with ESLint  
npm run lint
```

## Project Structure

```
skillswap-react/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ProtectedRouteWrapper.jsx
│   │   └── common/
│   │       ├── Layout.jsx
│   │       └── Navbar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── UserContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useUsers.js
│   ├── pages/
│   │   ├── Browse.jsx
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── Requests.jsx
│   │   ├── Signin.jsx
│   │   └── Signup.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── firebase.js
│   │   ├── requestService.js (functions exported from authService)
│   │   └── chatService.js (functions exported from authService)
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .env.local (create this with your values)
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Firebase Database Structure

```
firebase
├── users/
│   └── {uid}
│       ├── name: string
│       ├── email: string
│       ├── offer: string (skill they teach)
│       ├── learn: string (skill they want to learn)
│       ├── bio: string
│       ├── avgRating: number
│       ├── totalRatings: number
│       ├── sessionsCompleted: number
│       └── createdAt: timestamp
├── requests/
│   └── {requestId}
│       ├── fromUid: string
│       ├── toUid: string
│       ├── requestedSkill: string
│       ├── offeredSkill: string
│       ├── fromName: string
│       ├── toName: string
│       ├── status: "pending" | "accepted" | "rejected"
│       └── createdAt: timestamp
├── sessions/
│   └── {sessionId}
│       ├── initiatorUid: string
│       ├── mentorUid: string
│       ├── skillLearning: string
│       ├── skillTeaching: string
│       ├── status: "active" | "completed"
│       ├── createdAt: timestamp
│       └── messages: array
└── chats/
    └── {chatKey} (format: uid1_uid2)
        ├── uid1: string
        ├── uid2: string
        ├── uid1Name: string
        ├── uid2Name: string
        ├── createdAt: timestamp
        ├── lastMessage: string
        ├── lastMessageTime: timestamp
        └── messages/
            └── {messageId}
                ├── fromUid: string
                ├── text: string
                ├── timestamp: timestamp
                └── read: boolean
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

### Firebase Connection Issues

1. Check `.env.local` file has correct values
2. Verify Firebase project is active
3. Check Firebase security rules allow read/write in test mode
4. Check browser console for specific Firebase errors

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Hot Reload Not Working

Try restarting the dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## Security Considerations for Development

⚠️ **Never commit `.env.local` to version control!**

The `.env.local` file is already included in `.gitignore`, but always verify before committing.

### Test Mode Security Rules

Current Firebase Rules (Test Mode - for development only):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **NEVER use these rules in production!** See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for proper security rules.

## Next Steps

1. Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture
2. Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for development workflow
3. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing practices
4. See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) when ready to deploy
