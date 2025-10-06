# Next Steps - Bowling Stats Tracker Setup

## ✅ Completed So Far

1. ✅ Firebase CLI installed globally
2. ✅ Firebase project initialized (`bowlingstatstracker`)
3. ✅ Firestore database created
4. ✅ Security rules deployed
5. ✅ Firebase configuration files created

## 🎯 What You Need to Do Next

### Step 1: Copy Bowling App Files

The complete bowling app is in `bowling-app/` subdirectory. You need to copy its contents to integrate with your Firebase setup:

```bash
# In the WHS directory
cd bowling-app
npm install
```

### Step 2: Configure Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/bowlingstatstracker/settings/general)
2. Scroll to "Your apps" section
3. Click "Add app" → Web (</>) icon
4. Register your app with a nickname (e.g., "Bowling Stats Web App")
5. Copy the Firebase configuration

### Step 3: Create Environment File

Create `bowling-app/.env` file with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=bowlingstatstracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bowlingstatstracker
VITE_FIREBASE_STORAGE_BUCKET=bowlingstatstracker.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Enable Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/bowlingstatstracker/authentication)
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method
   - Add your email as a test user if needed

### Step 5: Test the App Locally

```bash
cd bowling-app
npm run dev
```

Visit `http://localhost:5173` and:
1. Try signing up with an email/password
2. Try signing in with Google
3. Explore the dashboard

### Step 6: Create Your First Coach Account

After signing up:
1. Go to [Firestore Console](https://console.firebase.google.com/project/bowlingstatstracker/firestore)
2. Find the `users` collection
3. Locate your user document
4. Edit the document and change `role` from `"player"` to `"coach"`

### Step 7: Deploy to Firebase Hosting (Optional)

```bash
# In the WHS directory (not bowling-app)
firebase init hosting

# Select:
# - Use existing project: bowlingstatstracker
# - Public directory: bowling-app/dist
# - Single-page app: Yes
# - Set up automatic builds: No

# Build the app
cd bowling-app
npm run build
cd ..

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://bowlingstatstracker.web.app`

### Step 8: Set Up Firebase Hosting (Detailed)

If you want to deploy the app:

```bash
# Initialize hosting (in WHS directory)
firebase init hosting

# When prompted:
# - What do you want to use as your public directory? bowling-app/dist
# - Configure as a single-page app? Yes
# - Set up automatic builds and deploys with GitHub? No
# - File bowling-app/dist/index.html already exists. Overwrite? No
```

Then build and deploy:
```bash
cd bowling-app && npm run build && cd ..
firebase deploy --only hosting
```

## 📋 Your Firebase Project Info

- **Project ID**: `bowlingstatstracker`
- **Project URL**: https://console.firebase.google.com/project/bowlingstatstracker
- **Firestore Database**: Created (nam5 region)
- **Security Rules**: ✅ Deployed

## 🔧 Quick Reference Commands

```bash
# Start development server
cd bowling-app && npm run dev

# Run tests
cd bowling-app && npm test

# Build for production
cd bowling-app && npm run build

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# View Firebase console
firebase open
```

## 📊 Features Ready to Use

### Core Features (Fully Implemented)
- ✅ User authentication (Email/Password + Google)
- ✅ Role-based access control (Player/Coach)
- ✅ USBC-compliant scoring engine
- ✅ Interactive pin-tap scoring UI
- ✅ Comprehensive statistics tracking
- ✅ Pin leaves heatmap
- ✅ Protected routes
- ✅ Mobile-responsive design

### Game Modes (Routing Ready, Needs Implementation)
- ⏳ Practice - Spares Only
- ⏳ Practice - Full Game
- ⏳ Match - Traditional (5-person)
- ⏳ Match - Baker (alternating frames)

### Coach Features (To Be Implemented)
- ⏳ Roster management
- ⏳ Team creation
- ⏳ Coach notes with tagging

## 🎯 Testing Checklist

Once deployed, test these features:

- [ ] Sign up with email/password
- [ ] Sign up with Google
- [ ] Log out and log back in
- [ ] Access dashboard
- [ ] View as Player role
- [ ] Change to Coach role and view dashboard
- [ ] Navigate between routes
- [ ] Test scoring interface (in bowling-app)
- [ ] View stats dashboard (in bowling-app)

## 🚨 Troubleshooting

### "Auth domain not configured"
- Make sure you've added your domain to authorized domains in Firebase Console → Authentication → Settings

### "Permission denied" errors
- Security rules are deployed
- Make sure user is authenticated
- Check user has correct role in Firestore

### Build errors
- Run `npm install` in bowling-app directory
- Check that Node.js version is 18+
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Environment variables not loading
- Make sure `.env` file is in `bowling-app/` directory
- Variables must start with `VITE_`
- Restart dev server after changing `.env`

## 📚 Documentation

- [Main README](bowling-app/README.md) - Full documentation
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment steps
- [Project Summary](bowling-app/PROJECT_SUMMARY.md) - Features overview

## 🎉 What's Next?

After completing these steps:

1. **Test locally** - Make sure everything works
2. **Deploy to Firebase** - Get it live
3. **Invite team members** - Have them sign up
4. **Promote a coach** - Change a user's role to coach
5. **Start tracking games** - Use the scoring interface
6. **Implement remaining features** - Practice modes, team management

## 💡 Tips

1. **Use Firestore emulator for development**:
   ```bash
   firebase emulators:start --only firestore
   ```

2. **Monitor usage** in Firebase Console to avoid billing surprises

3. **Create composite indexes** as needed when you get Firestore errors

4. **Set up Firebase Functions** later for automated tasks

5. **Consider PWA** for offline capabilities

---

**Questions?** Check the documentation in the `bowling-app/` directory or Firebase docs at https://firebase.google.com/docs
