# SkillSwap React - Testing Guide

## Test Strategy Overview

SkillSwap React uses a multi-layer testing approach:
- **Manual Testing**: User workflows (currently primary)
- **Unit Tests**: Service functions and hooks (can be added)
- **Integration Tests**: Features and workflows (can be added)
- **E2E Tests**: Full user journeys (future)

## Manual Testing Workflows

### 1. Authentication Flow

#### Test: User Signup
**Objective**: Verify users can register with valid and invalid data

```
Steps:
1. Navigate to /signup
2. Enter invalid data (empty fields, weak password, invalid email)
   ✓ Should see field-level validation errors
3. Clear errors and enter valid data:
   - Name: "Alice Johnson"
   - Email: "alice@example.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
   - Skill to teach: "Python"
   - Skill to learn: "JavaScript"
4. Click "Sign Up"
   ✓ Should redirect to signin page
   ✓ Should see success message
5. Go back to /signup and try same email
   ✓ Should see "Email already registered" error
```

#### Test: User Login
**Objective**: Verify users can login with correct and incorrect credentials

```
Steps:
1. Navigate to /signin
2. Try wrong email format
   ✓ Should show validation error
3. Try non-existent email
   ✓ Should show "Email not registered" error
4. Enter valid email but wrong password
   ✓ Should show "Incorrect password" error
5. Enter correct credentials (from signup test)
   ✓ Should redirect to /home
   ✓ Navbar should show user name
   ✓ Should see personalized dashboard
```

#### Test: Logout
**Objective**: Verify logout works and redirects properly

```
Steps:
1. Login successfully (from above)
2. Click logout button in navbar
   ✓ Should redirect to /signin
   ✓ Navbar should no longer show user name
   ✓ Cannot access /profile, /browse, /chat, /requests without logging in
```

### 2. Profile Management

#### Test: View Own Profile
**Objective**: Verify users can view their own profile

```
Steps:
1. Login and navigate to /profile
   ✓ Should show your profile information
   ✓ Should see "Edit Profile" button
   ✓ Avatar shows your initial
   ✓ Skills display with colors (teaching = green, learning = orange)
```

#### Test: Edit Profile
**Objective**: Verify users can edit their profile

```
Steps:
1. On own profile, click "Edit Profile"
   ✓ Form appears with editable fields
2. Update name to "Alice Developer"
3. Update bio to "Python expert, learning JavaScript"
4. Try adding invalid skill
   ✓ Should show error on submit
5. Update skill to learn to "React"
6. Click "Save Changes"
   ✓ Should show success message
   ✓ UI should update with new data
```

#### Test: View Other User Profile
**Objective**: Verify users can view other users' profiles

```
Steps:
1. Navigate to /browse
2. Click "View Profile" on any user card
   ✓ URL should show ?uid={otherUserId}
   ✓ Should NOT see "Edit Profile" button
   ✓ Should see user's information
```

### 3. Browse & Discovery

#### Test: Browse Mentors List
**Objective**: Verify users can see available mentors

```
Steps:
1. Login and navigate to /browse
   ✓ Should see list of all other users (not yourself)
   ✓ Each card shows: name, rating, skills, sessions completed
2. Verify user count is correct (total users - 1)
```

#### Test: Search Functionality
**Objective**: Verify search filters users by name/email

```
Steps:
1. On /browse, enter "Alice" in search box
   ✓ Should filter to show only users with "Alice" in name/email
2. Clear search
   ✓ Should show all users again
3. Search for non-existent name
   ✓ Should show empty state message
```

#### Test: Skill Filters
**Objective**: Verify users can filter by skills

```
Steps:
1. On /browse, select "Python" in "Can Teach" dropdown
   ✓ Should show only users offering Python
2. Also select "JavaScript" in "Wants to Learn" dropdown
   ✓ Should show users teaching Python AND learning JavaScript
3. Click "Clear all filters"
   ✓ Should reset to show all users
```

### 4. Request System

#### Test: Send Learning Request
**Objective**: Verify users can send requests to learn from others

```
Steps:
1. On /browse, find user offering "Python"
2. Click "Connect" button
   ✓ Modal appears asking what you want to learn
   ✓ Dropdown shows skills they offer
3. Select "Python" from dropdown
4. Select a skill you can teach (e.g., "JavaScript")
5. Click "Send Request"
   ✓ Modal closes
   ✓ Should see success message
   ✓ Request saved to Firebase
```

#### Test: View Incoming Requests
**Objective**: Verify users can see requests from others

```
Steps:
1. Login as second user
2. Navigate to /requests
3. Click "Incoming" tab
   ✓ Should see request from first user
   ✓ Should see both users' names and skills
4. Verify badge shows count of pending requests
```

#### Test: Accept Request
**Objective**: Verify users can accept learning requests

```
Steps:
1. View incoming request (from above)
2. Click "Accept" button
   ✓ Request status changes to "Connected"
   ✓ Session created in Firebase
   ✓ Should see success message
   ✓ Can now chat with that user
```

#### Test: Decline Request
**Objective**: Verify users can decline requests

```
Steps:
1. Send new request from first user to second
2. As second user, view incoming requests
3. Click "Decline" button
   ✓ Request status changes to "Declined"
   ✓ Can still view in history
```

### 5. Chat System

#### Test: Start Chat After Request Acceptance
**Objective**: Verify users can chat after accepting requests

```
Steps:
1. Have accepted a request (from above)
2. As either user, navigate to /chat?uid={otherUserId}
   ✓ Chat interface loads
   ✓ Shows other user's name and profile info
3. Cannot see any previous messages yet (first time)
```

#### Test: Send Chat Messages
**Objective**: Verify messages send and display correctly

```
Steps:
1. In chat view, type "Hello! Let's start learning"
2. Click "Send" or press Enter
   ✓ Message appears on left side (in blue)
   ✓ Shows timestamp
   ✓ Input clears
3. Switch to other user's account
4. Navigate to /chat?uid={firstUserId}
   ✓ Message appears on right side (in gray)
   ✓ Shows sender name (for incoming messages)
```

#### Test: Chat History
**Objective**: Verify messages persist across sessions

```
Steps:
1. Send 3-4 messages back and forth between users
2. Close browser or logout
3. Login to same account
4. Navigate to chat again
   ✓ All previous messages should display
   ✓ Messages in correct order with timestamps
```

### 6. Protected Routes

#### Test: Cannot Access Protected Pages Without Login
**Objective**: Verify unauthenticated users can't access protected pages

```
Steps:
1. Logout (if logged in)
2. Try to navigate directly to:
   - /profile → should redirect to signin
   - /browse → should redirect to signin
   - /chat → should redirect to signin
   - /requests → should redirect to signin
3. Should only be able to see:
   - /signin (with signup link)
   - /signup (with signin link)
```

#### Test: Redirect to Signin After Session Expiry
**Objective**: Verify app handles logout properly

```
Steps:
1. Login successfully
2. Check Firebase authentication in browser console
3. In Firebase Console, disable user or clear auth
4. Refresh page
   ✓ Should redirect to signin
```

## Edge Cases & Error Scenarios

### Test: Database Connection Lost
**Scenario**: Firebase database becomes unavailable

```
Setup:
1. Start app and load /browse
2. Disconnect internet (or block Firebase in DevTools)

Test:
1. Try to send a request
   ✓ Should show error message
   ✓ Should allow retry
```

### Test: Slow Network
**Scenario**: Slow 3G network conditions

```
Setup:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"

Test:
1. Click "Connect" and send request
   ✓ Should show loading state
   ✓ Should eventually succeed or show error
```

### Test: Form Validation Edge Cases
**Scenario**: Various invalid inputs

```
Tests:
1. Name with only spaces → should show error
2. Password with exactly 6 characters → should accept
3. Email with multiple @ symbols → should show error
4. Very long name (100+ characters) → should accept or limit
```

## Browser Testing

### Tested Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Test on Each Browser:
```
1. Load homepage
   ✓ No console errors
   ✓ Tailwind styles apply
   ✓ Responsive layout works
2. Go through full signup flow
3. Chat with message input
4. Check form validation
```

## Responsive Design Testing

### Desktop (1920px)
```
✓ All columns visible
✓ Full grid layout
✓ Navbar properly spaced
```

### Tablet (768px)
```
✓ Grid adjusts to 2 columns
✓ Buttons resize appropriately
✓ Search/filter stack properly
```

### Mobile (375px)
```
✓ Grid to single column
✓ All buttons clickable
✓ Chat input usable
✓ Navigation responsive
```

## Test Data Setup

### Create Test Users
For comprehensive testing, create these accounts:

```
User 1 - Alice (Python Expert)
- Email: alice@example.com
- Password: Test123456
- Teach: Python
- Learn: JavaScript

User 2 - Bob (Web Developer)
- Email: bob@example.com
- Password: Test123456
- Teach: React, JavaScript
- Learn: Python, Django

User 3 - Carol (Designer)
- Email: carol@example.com
- Password: Test123456
- Teach: UI/UX, Figma
- Learn: React, Next.js
```

## Performance Testing

### Check Page Load Times
```
1. Open DevTools → Performance tab
2. Reload each page
3. Check load times:
   ✓ /home: < 2 seconds
   ✓ /signin: < 1.5 seconds
   ✓ /browse: < 2 seconds (loading users from Firebase)
   ✓ /profile: < 1.5 seconds
```

### Check Memory Usage
```
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Use app for 5-10 minutes
4. Take another heap snapshot
5. Memory should not grow excessively (no major leaks)
```

## Automated Testing (Future)

### Unit Tests Example (Vitest)
```javascript
// tests/services/authService.test.js
import { describe, it, expect } from 'vitest';
import { validationService } from '../../src/services/authService';

describe('validationService', () => {
  it('should validate email format', () => {
    const result = validationService.validateEmail('test@example.com');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = validationService.validateEmail('invalid-email');
    expect(result.valid).toBe(false);
  });
});
```

To implement: Add Vitest + testing-library, then run `npm test`

## Test Checklist

- [ ] Can signup with valid data
- [ ] Cannot signup with invalid data
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Can logout successfully
- [ ] Can view own profile
- [ ] Can edit own profile
- [ ] Can view other users' profiles
- [ ] Can browse all users
- [ ] Can search users
- [ ] Can filter by skills
- [ ] Can send learning requests
- [ ] Can receive requests
- [ ] Can accept requests
- [ ] Can decline requests
- [ ] Can send chat messages
- [ ] Messages persist across sessions
- [ ] Protected routes redirect to signin
- [ ] App handles errors gracefully
- [ ] Mobile responsive
- [ ] Loading states show
- [ ] Success messages display
- [ ] Error messages display