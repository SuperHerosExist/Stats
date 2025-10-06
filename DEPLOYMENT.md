# Deployment Guide

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Enable **Email/Password** provider
3. Enable **Google** provider
   - Add your OAuth client ID and secret (for production)

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Start in **Production mode** (we have security rules)
3. Choose a location (preferably close to your users)

### 4. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Hosting (optional)

# Deploy security rules
firebase deploy --only firestore:rules
```

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Get your Firebase config from **Project Settings** → **General** → **Your apps**
3. Fill in the values in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deploy to Firebase Hosting

### Option 1: Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure
```

### Option 3: Netlify

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Initial Data Setup

### Create First Coach Account

1. Go to your deployed app
2. Sign up with an account
3. Manually update the user's role in Firestore:
   - Go to Firestore Console
   - Navigate to `users` collection
   - Find your user document
   - Change `role` field from `player` to `coach`

### Create Program

```javascript
// In Firestore Console, create a document in 'programs' collection:
{
  id: "auto-generated",
  name: "High School Bowling Team",
  schoolName: "Your High School",
  season: "2024-2025",
  createdAt: serverTimestamp()
}
```

### Link Coach to Program

Update the coach's user document:
```javascript
{
  ...existing fields,
  programId: "program-id-from-above"
}
```

## Production Checklist

- [ ] Firebase project created
- [ ] Authentication providers enabled
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Environment variables configured
- [ ] App built and deployed
- [ ] First coach account created
- [ ] Program created and linked
- [ ] Test login and basic functionality
- [ ] Monitor Firebase usage and costs

## Monitoring

### Firebase Console
- Check **Authentication** for user growth
- Monitor **Firestore** usage and costs
- Review **Performance** tab for app metrics

### Error Tracking
Consider adding error tracking:
```bash
npm install @sentry/react
```

Then configure in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## Scaling Considerations

### Firestore Limits
- Max 1 write/second per document
- Use subcollections for high-write scenarios
- Consider batch writes for multiple updates

### Cost Optimization
- Enable offline persistence to reduce reads
- Use Firestore emulator for local development
- Monitor usage in Firebase Console

### Performance
- Implement virtual scrolling for long lists
- Lazy load images and heavy components
- Use React.memo() for expensive components
- Consider PWA for offline capabilities
