# SkillSwap React - Developer Guide

## Architecture Overview

SkillSwap follows a modern React architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│          React Components (UI Layer)            │
├─────────────────────────────────────────────────┤
│  Custom Hooks (useAuth, useUsers, etc)          │
├─────────────────────────────────────────────────┤
│  Context Providers (AuthContext, UserContext)   │
├─────────────────────────────────────────────────┤
│  Services (authService, requestService, etc)    │
├─────────────────────────────────────────────────┤
│  Firebase (Authentication, Realtime DB, Storage)│
└─────────────────────────────────────────────────┘
```

## Project Structure Detailed

### `src/components/`

**Purpose**: Reusable UI components

#### `components/auth/`
- **ProtectedRoute.jsx**: Wraps routes requiring authentication
  - Checks `useAuth()` for logged-in user
  - Redirects to `/signin` if not authenticated
  - Usage: Wraps every page except signin/signup

#### `components/common/`
- **Layout.jsx**: Main app wrapper with navbar
  - Provides consistent styling and spacing
  - Shows navbar with user info and logout
  - Usage: Wraps all page content

### `src/context/`

**Purpose**: Global state management using React Context

#### AuthContext.jsx
```javascript
// State
- user: Firebase Auth user object
- userProfile: User data from database (name, skills, bio, etc)
- loading: Boolean for async operations
- error: Error messages

// Methods
- signup(email, password, name, skillOffer, skillLearn)
- login(email, password)
- logout()
- updateProfile(updates)

// Usage
const { userProfile, isAuthenticated } = useAuth();
```

Flow Diagram:
```
User Signup Form
      ↓
authService.signup() validates inputs
      ↓
Firebase creates auth user
      ↓
UserProfile saved to database
      ↓
AuthContext.userProfile updated
      ↓
UI re-renders with new user data
```

#### UserContext.jsx
```javascript
// State
- users: Array of all users except current
- usersLoading: Boolean
- usersError: Error message

// Methods
- fetchAllUsers()
- searchUsers(query)
- filterBySkills(skillOffer, skillLearn)

// Auto-fetches on user login, clears on logout
```

### `src/hooks/`

**Purpose**: Custom React hooks for code reuse

#### useAuth.js
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

Usage:
```javascript
const { userProfile, isAuthenticated } = useAuth();
```

#### useUsers.js
```javascript
export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within UserProvider');
  }
  return context;
};
```

Usage:
```javascript
const { users, searchUsers } = useUsers();
```

### `src/services/`

**Purpose**: Business logic and Firebase operations

#### authService.js

**validationService** - Input validation
```javascript
validationService.validateEmail(email)
  // Returns { valid: boolean, error?: string }

validationService.validatePassword(password)
validationService.validateName(name)
validationService.validateSkill(skill)
validationService.getValidSkills()
  // Returns array of 36 allowed skills
```

**authService** - Authentication
```javascript
authService.signup(email, password, name, skillOffer, skillLearn)
  // Creates Firebase auth user
  // Saves user profile to database
  // Returns { success, user, error? }

authService.login(email, password)
  // Authenticates with Firebase
  // Returns { success, user, error? }

authService.logout()
  // Signs out from Firebase
  // Clears auth state

authService.getCurrentUser()
  // Returns current Firebase user

authService.onAuthStateChanged(callback)
  // Listener for auth state changes
```

**userService** - User data operations
```javascript
userService.getUser(uid)
  // Fetches single user profile

userService.updateUser(uid, updates)
  // Updates user data in database

userService.getUsersExceptCurrent(currentUid)
  // Gets all users except specified UID
  // Used for Browse page
```

**requestService** - Learning requests
```javascript
requestService.createRequest(fromUid, toUid, requestedSkill, offeredSkill)
  // Creates new connection request

requestService.getIncomingRequests(uid)
  // Gets requests where uid is recipient

requestService.getSentRequests(uid)
  // Gets requests where uid is sender

requestService.acceptRequest(requestId, currentUid)
  // Accepts request and creates session

requestService.rejectRequest(requestId, currentUid)
  // Rejects request
```

**chatService** - Messaging
```javascript
chatService.sendMessage(chatId, fromUid, message)
  // Saves message to database

chatService.getMessages(chatId, callback)
  // Real-time listener for new messages

chatService.getChats(uid)
  // Gets all active chats for user

chatService.startChat(uid1, uid2, fromName, toName)
  // Initializes new chat
```

#### firebase.js
```javascript
// Initializes Firebase and exports instances
export { auth, database, storage };
```

### `src/pages/`

**Purpose**: Full page components

#### Home.jsx
- Landing page for guests
- Dashboard for authenticated users
- Shows stats, quick actions, skills summary

#### Signin.jsx
- Email/password login form
- Field-level validation
- Error handling

#### Signup.jsx
- User registration form
- Collects: name, email, password, skill to teach, skill to learn
- Full form validation

#### Profile.jsx
- View any user's profile
- Edit own profile
- Skills display with tags
- Rating and sessions info

#### Browse.jsx
- Lists all other users
- Search by name/email
- Filter by skills
- Connect/request modal
- User cards with info

#### Requests.jsx
- Incoming requests tab
- Sent requests tab
- Accept/decline actions
- Request status tracking

#### Chat.jsx
- Real-time messaging interface
- Loads messages from database
- Send/receive functionality
- Shows other user info

### `src/App.jsx`

**Purpose**: Main routing and provider setup

```javascript
// Structure
<BrowserRouter>
  <AuthProvider>
    <UserProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      </Routes>
    </UserProvider>
  </AuthProvider>
</BrowserRouter>
```

**Provider Nesting Order** (important!):
1. BrowserRouter (routing)
2. AuthProvider (global auth state)
3. UserProvider (user discovery state)

## Data Flow Examples

### Example 1: User Signup Flow
```
User fills signup form
  ↓
handleSubmit validates all fields (via validationService)
  ↓
Calls AuthContext.signup()
  ↓
authService.signup() validates again
  ↓
createUserWithEmailAndPassword() creates auth user
  ↓
set(database, users/{uid}) saves profile
  ↓
AuthContext updates state
  ↓
Components using useAuth() re-render
  ↓
Auto-logout and redirect to signin
```

### Example 2: Browse and Send Request
```
User navigates to /browse
  ↓
Browse component calls useUsers()
  ↓
UserContext fetches all users from database
  ↓
Users rendered in cards with filters
  ↓
User clicks "Connect" on a card
  ↓
RequestModal opens showing skills
  ↓
User selects skills and clicks "Send Request"
  ↓
handleSendRequest() calls requestService.createRequest()
  ↓
Request saved to database at /requests/{requestId}
  ↓
Recipient notified on their /requests page
```

### Example 3: Accept Request and Chat
```
Recipient sees incoming request
  ↓
Clicks "Accept"
  ↓
requestService.acceptRequest() updates request status
  ↓
New session created in database at /sessions/{sessionId}
  ↓
Chat becomes available at /chat?uid={otherUserId}
  ↓
chatService.startChat() creates chat entry
  ↓
User types message and clicks Send
  ↓
chatService.sendMessage() saves message to database
  ↓
onChildAdded() listener fires on recipient's chat
  ↓
New message appears in real-time
```

## Development Workflow

### 1. Setup
```bash
npm install
npm run dev
```

### 2. Feature Development

**Step 1: Identify what needs state**
```javascript
// In component
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
```

**Step 2: Create service functions (if backend needed)**
```javascript
// In authService.js
export const myFeatureService = {
  doSomething: async (data) => {
    // Validate
    // Call Firebase
    // Error handling
    // Return { success, error?, data? }
  }
};
```

**Step 3: Use in component**
```javascript
import { myFeatureService } from '../services/authService';

const MyComponent = () => {
  const [data, setData] = useState(null);
  
  const handleAction = async () => {
    const result = await myFeatureService.doSomething(formData);
    if (result.success) {
      setData(result.data);
    }
  };
};
```

### 3. Best Practices

#### Component Organization
```javascript
// ✅ Good
const MyPage = () => {
  // 1. Hooks at top
  const { userProfile } = useAuth();
  const [data, setData] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Handlers
  const handleSubmit = async () => { };
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### Error Handling
```javascript
// ✅ Good
try {
  const result = await authService.login(email, password);
  if (result.success) {
    // Handle success
  } else {
    setError(result.error);
  }
} catch (err) {
  console.error(err);
  setError('An unexpected error occurred');
}
```

#### Async/Loading States
```javascript
// ✅ Good
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // Do async work
  } finally {
    setLoading(false);
  }
};

// In JSX
<button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

#### Validation
```javascript
// ✅ Good - validate in service layer
const { valid, error } = validationService.validateEmail(email);
if (!valid) {
  setErrors(prev => ({ ...prev, email: error }));
  return;
}

// Then call Firebase
```

### 4. Adding New Features

#### Feature: User Rating System

**Step 1: Update database schema**
```javascript
// In signup, initialize:
avgRating: 1,
totalRatings: 0,
```

**Step 2: Create service**
```javascript
// authService.js
export const ratingService = {
  addRating: async (userId, rating) => {
    // Get current user data
    const user = await userService.getUser(userId);
    
    // Calculate new average
    const newTotal = user.totalRatings + 1;
    const newAvg = (user.avgRating * user.totalRatings + rating) / newTotal;
    
    // Update database
    await userService.updateUser(userId, {
      avgRating: newAvg,
      totalRatings: newTotal
    });
    
    return { success: true };
  }
};
```

**Step 3: Create component**
```javascript
// Components/RatingStars.jsx
export const RatingStars = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  
  const handleSubmit = async () => {
    const result = await ratingService.addRating(userId, rating);
    if (result.success) onSubmit();
  };
  
  return (
    <div>
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          onClick={() => setRating(i)}
          className={i <= rating ? 'text-yellow' : 'text-gray'}
        >
          ★
        </button>
      ))}
    </div>
  );
};
```

**Step 4: Use in page**
```javascript
// Profile.jsx
<RatingStars onSubmit={() => alert('Thank you!')} />
```

## Testing During Development

### Use Console for Quick Tests
```javascript
// In browser console
const authService = window.authService; // exported globally for testing

// Test validation
authService.validationService.validateEmail('test@example.com');
// { valid: true }

authService.validationService.validateEmail('invalid');
// { valid: false, error: 'Invalid email format' }
```

### Firebase Console Monitoring
1. Open Firebase Console in browser
2. Go to Realtime Database
3. Watch real-time updates as you interact with app
4. Monitor Authentication → Users list

### DevTools Network Tab
1. Open DevTools → Network
2. Filter by "firebase"
3. See all requests to Firebase
4. Check response status and data

## Common Issues & Solutions

### Issue: Component not updating after state change

**Cause**: Direct mutation of state
```javascript
// ❌ Wrong
state.push(newItem);
setState(state);

// ✅ Correct
setState([...state, newItem]);
```

### Issue: Infinite loop in useEffect

**Cause**: Missing dependency array
```javascript
// ❌ Wrong
useEffect(() => {
  loadData(); // Runs every render!
});

// ✅ Correct
useEffect(() => {
  loadData();
}, []); // Runs once on mount
```

### Issue: Firebase rules blocking requests

**Cause**: Need to update security rules
```javascript
// In Firebase Console → Realtime Database → Rules
// Make sure authenticated users can read/write appropriate paths
```

### Issue: Page refreshes and user data disappears

**Cause**: AuthContext not persisting
**Solution**: Firebase persists auth session automatically, but verify:
```javascript
// In AuthContext
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    if (user) loadUserProfile(user.uid);
  });
  
  return unsubscribe;
}, []);
```

## Code Style Guidelines

### Naming Conventions
```javascript
// ✅ Components: PascalCase
export const UserCard = () => {};

// ✅ Hooks: camelCase with 'use' prefix
export const useAuth = () => {};

// ✅ Functions: camelCase
const handleSubmit = () => {};
const loadUsers = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_SKILLS = 36;
const VALID_SKILLS = [];

// ✅ State: camelCase
const [isLoading, setIsLoading] = useState(false);
const [userProfile, setUserProfile] = useState(null);
```

### File Structure
```
src/
  pages/
    MyFeature.jsx          // Page component
  components/
    MyFeature/
      MyFeatureCard.jsx    // Sub-component
      MyFeatureForm.jsx    # Sub-component
  services/
    myFeatureService.js    # Service functions
  hooks/
    useMyFeature.js        # Custom hook
```

### Comments
```javascript
// ✅ Good
// Calculate average rating from reviews
const avgRating = ratings.reduce((a, b) => a + b) / ratings.length;

// ❌ Avoid obvious comments
const users = []; // Create an array
```

## Performance Tips

### 1. Use useMemo for expensive calculations
```javascript
const filteredUsers = useMemo(() => {
  return users.filter(u => u.skill === selected);
}, [users, selected]);
```

### 2. Use useCallback for event handlers passed to children
```javascript
const handleDelete = useCallback((id) => {
  deleteUser(id);
}, []);

return <UserCard onDelete={handleDelete} />;
```

### 3. Avoid inline functions
```javascript
// ❌ Bad
<button onClick={() => loadUsers()}>Load</button>

// ✅ Good
const handleLoad = useCallback(() => {
  loadUsers();
}, []);

<button onClick={handleLoad}>Load</button>
```

### 4. Code splitting for large components
```javascript
const Browse = lazy(() => import('./pages/Browse'));

<Suspense fallback={<Loading />}>
  <Browse />
</Suspense>
```

## Debugging Tips

### 1. React DevTools Extension
- Install "React Developer Tools" browser extension
- View component hierarchy
- Inspect props and state
- Track component re-renders

### 2. Firebase Emulator (Advanced)
```bash
firebase emulators:start
```

Allows local testing without hitting production Firebase.

### 3. Console Logging
```javascript
console.log('User:', userProfile);
console.table(users); // Format array as table
console.dir(object);  // Show object properties
console.time('label'); // Measure performance
```

## Useful Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)

## Getting Help

1. Check browser console for errors
2. Check Firebase Console for data issues
3. Check network tab to see API calls
4. Review code comments above
5. Reference test guide for troubleshooting workflows

