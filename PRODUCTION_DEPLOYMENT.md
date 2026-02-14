# SkillSwap React - Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All testing completed (see [TESTING_GUIDE.md](./TESTING_GUIDE.md))
- [ ] Code review done
- [ ] Security rules reviewed and implemented
- [ ] Environment variables configured for production
- [ ] Database backup created
- [ ] SSL certificate ready (if self-hosted)
- [ ] Analytics setup (optional)
- [ ] Email verification configured (optional)

## Firebase Production Setup

### 1. Update Security Rules

⚠️ **CRITICAL**: Replace test mode rules with production rules before deploying!

#### Firebase Realtime Database Rules

In Firebase Console → Realtime Database → Rules, replace with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid",
        "name": { ".validate": true },
        "email": { ".validate": true },
        "offer": { ".validate": true },
        "learn": { ".validate": true },
        "bio": { ".validate": true },
        "avgRating": { ".validate": true },
        "totalRatings": { ".validate": true },
        "sessionsCompleted": { ".validate": true },
        "createdAt": { ".validate": true }
      }
    },
    "requests": {
      "$requestId": {
        ".read": "auth != null && (root.child('requests').child($requestId).child('fromUid').val() === auth.uid || root.child('requests').child($requestId).child('toUid').val() === auth.uid)",
        ".write": "auth != null && (newData.child('fromUid').val() === auth.uid || newData.child('toUid').val() === auth.uid)",
        "fromUid": { ".validate": true },
        "toUid": { ".validate": true },
        "requestedSkill": { ".validate": true },
        "offeredSkill": { ".validate": true },
        "status": { ".validate": true },
        "createdAt": { ".validate": true }
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "uid1": { ".validate": true },
        "uid2": { ".validate": true },
        "messages": {
          "$messageId": {
            ".write": "newData.child('fromUid').val() === auth.uid",
            "fromUid": { ".validate": true },
            "text": { ".validate": true },
            "timestamp": { ".validate": true }
          }
        }
      }
    },
    "sessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### 2. Enable Additional Security Features

#### Email Verification
In Firebase Console → Authentication → Templates → Email Verification:
1. Customize email template (optional)
2. Update sign-up code to require verification:

```javascript
// In authService.js - update signup
await authService.signup(...);
// Add after account creation:
await sendEmailVerification(auth.currentUser);
```

#### Password Reset
1. In Authentication → Templates → Password Reset, customize email
2. Users accessing `/forgot-password` should receive reset links

#### Account Deletion
Implement in future sprint:
1. Add delete account option in Profile
2. Delete user data from Realtime Database
3. Delete Firebase Auth user

### 3. Environment Variables for Production

Create `.env.production` (or update `.env.local`):

```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Source maps (for debugging in production)

### 2. Test Production Build Locally

```bash
npm run preview
```

Then visit `http://localhost:4173` and test:
- [ ] Signup/Login flows work
- [ ] All pages load correctly
- [ ] Chat messages send
- [ ] No console errors
- [ ] Responsive design works

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting is ideal for React apps and integrates seamlessly with Firebase backend.

#### Installation

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting
```

#### Configuration (.firebaserc)

Create `.firebaserc` in project root:

```json
{
  "projects": {
    "default": "skillswap-project-id"
  }
}
```

#### Deploy

```bash
firebase deploy --only hosting
```

**Features:**
- ✅ Free SSL/TLS certificate
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Instant deployments
- ✅ Preview URLs before going live
- ✅ Firebase-integrated (auth, database work seamlessly)

### Option 2: Vercel

Vercel provides excellent support for Next.js and Vite apps.

#### Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts to connect GitHub repository

**Features:**
- ✅ Automated deployments on git push
- ✅ Preview deployments
- ✅ Serverless functions (for backend)
- ✅ Analytics included
- ✅ Edge middleware

### Option 3: Netlify

Another popular hosting platform with great DX.

#### Setup

1. Connect GitHub repository at [netlify.com](https://netlify.com)

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Add environment variables in Netlify dashboard

**Features:**
- ✅ Git-based deployments
- ✅ Atomic deployments
- ✅ Branch previews
- ✅ Functions (Node.js backend)

### Option 4: Self-Hosted (AWS, DigitalOcean, etc.)

For VPS hosting with more control:

#### Via Nginx

1. Build the app:
```bash
npm run build
```

2. Upload `dist/` folder to server

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your_cert.crt;
    ssl_certificate_key /etc/ssl/private/your_key.key;

    root /var/www/skillswap/dist;

    # SPA routing - serve index.html for unknown routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

4. Setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot -d yourdomain.com
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Test live URL
curl https://yourdomain.com/api/health

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

### 2. Setup Monitoring

#### Firebase Console
- Monitor authentication usage
- Watch database read/write operations
- Check for security alerts

#### Application Monitoring
Consider adding:
- Sentry (error tracking)
- Google Analytics (user analytics)
- LogRocket (session replay)

#### Setup Google Analytics

1. Create Google Analytics property
2. Add to `src/main.jsx`:

```javascript
import ReactGA from 'react-ga4';

ReactGA.initialize('GA_MEASUREMENT_ID');
ReactGA.send(pageview);
```

### 3. Setup Custom Domain (Firebase Hosting)

1. In Firebase Console → Hosting → Custom domain
2. Click "Connect custom domain"
3. Verify domain ownership
4. Update DNS records (Firebase provides steps)

### 4. Setup Email Service

For welcome emails, password resets, notifications:

#### Option A: Firebase Email Templates
- Built-in (limited customization)
- No additional cost

#### Option B: SendGrid
```bash
npm install @sendgrid/mail
```

```javascript
// Example: send welcome email
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: userEmail,
  from: 'noreply@skillswap.com',
  subject: 'Welcome to SkillSwap!',
  html: '<h1>Welcome!</h1>'
});
```

### 5. Database Backups

Enable automatic backups:

1. Firebase Console → Realtime Database → Backups
2. Enable daily automated backups
3. Or use:

```bash
firebase database:get / > backup.json
```

### 6. Setup Monitoring & Alerts

In Firebase Console:
1. Analytics → Dashboard to monitor key metrics
2. Performance → Monitor app performance
3. Errors → Track JavaScript errors

## Performance Optimization

### 1. Code Splitting

Vite automatically handles this, but verify:

```javascript
// Lazy load pages
const Browse = lazy(() => import('./pages/Browse'));
const Chat = lazy(() => import('./pages/Chat'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/browse" element={<Browse />} />
  </Routes>
</Suspense>
```

### 2. Image Optimization

Use Firebase Storage for images:

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const uploadAvatar = async (uid, file) => {
  const avatarRef = ref(storage, `avatars/${uid}`);
  await uploadBytes(avatarRef, file);
  const url = await getDownloadURL(avatarRef);
  return url;
};
```

### 3. Database Query Optimization

Use pagination for large lists:

```javascript
const getUsers = async (limit = 20, startAt = null) => {
  let q = query(
    ref(database, 'users'),
    limitToFirst(limit + 1)
  );
  
  if (startAt) {
    q = query(
      ref(database, 'users'),
      startAt(startAt),
      limitToFirst(limit + 1)
    );
  }
  
  return q;
};
```

## Troubleshooting Production Issues

### Issue: Routing Returns 404

**Solution**: Configure host to serve index.html for unknown routes

**Firebase Hosting:**
```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Issue: Firebase Rules Block Requests

**Solution**: Check browser console for Firebase errors

```javascript
// In console, check:
firebase.database().ref('path').get()
  .catch(err => console.error(err));
```

Then verify rules in Firebase Console match your app.

### Issue: Slow Load Times

**Solution**: Check:
1. Firebase region (choose closest to users)
2. Bundle size: `npm run build -- --analyze`
3. Network tab in DevTools
4. Enable compression in hosting config

## Monitoring & Maintenance

### Weekly
- [ ] Check Firebase error logs
- [ ] Monitor user growth
- [ ] Review database usage

### Monthly
- [ ] Backup database
- [ ] Review security rules
- [ ] Check performance metrics
- [ ] Update dependencies: `npm outdated`

### Quarterly
- [ ] Security audit
- [ ] Load testing
- [ ] Update documentation

## Scaling Considerations

As user base grows, consider:

1. **Database Read/Write Limits**
   - Firebase Realtime DB: 100,000 concurrent connections
   - May need to migrate to Firestore for scale

2. **Caching Layer**
   - Add Redis for hot data
   - Cache user profiles, skill lists

3. **File Storage**
   - Firebase Storage has rate limits
   - Consider CDN for avatars, files

4. **API Backend**
   - Add Node.js/Python backend for complex operations
   - Use Firebase Cloud Functions for serverless logic

## Rollback Procedures

### Firebase Hosting
```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:channel:deploy <channel-name>
```

### Database Rollback
```bash
# Restore from backup
firebase database:restore <backup-id>
```

## Success Criteria

Your production deployment is ready when:

- ✅ All pages load < 2 seconds
- ✅ No console errors
- ✅ Authentication works smoothly
- ✅ Chat messages send reliably
- ✅ Database queries are fast
- ✅ Mobile responsive
- ✅ SSL certificate valid
- ✅ Backups enabled
- ✅ Monitoring active
- ✅ Team has deployment access

## Support & Documentation

For issues:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
3. Check Firebase documentation
4. Review browser console for specific errors

