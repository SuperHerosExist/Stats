# Willard High School Bowling Statistics Tracker

A production-ready web application for managing high school bowling programs with comprehensive scoring, statistics tracking, and team management features.

![React](https://img.shields.io/badge/react-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-blue)
![Firebase](https://img.shields.io/badge/firebase-11.2.0-orange)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-4.1.0-38bdf8)
![Vite](https://img.shields.io/badge/vite-7.1.9-646cff)

## Features

### Player Features
- **Authentication**: Email/password and Google OAuth sign-in
- **Practice Modes**:
  - Spares Only: Practice specific spare drills with conversion tracking
  - Full Game: Bowl complete 10-frame games
- **Match Modes**:
  - Traditional: 5-person team, each bowls full games
  - Baker: 5 players alternate frames (P1:F1, P2:F2, etc.)
- **Comprehensive Stats**:
  - Average score, high game
  - Strike %, spare %, split conversion %
  - Pin leaves heatmap with conversion rates
  - First ball average, pocket hit %, carry rate
  - Double/triple percentages

### Coach Features
- **Roster Management**: Add/remove players, create teams of 5
- **Team Dashboard**: View aggregated team stats and comparisons
- **Private Notes**: Rich text notes with tagging per player/session
- **Full Access**: View all player and team data

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS (mobile-first)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project (create at https://console.firebase.google.com)

### Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase config:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, SignUp
│   ├── scoring/       # Pin grid, scoring controls, score header
│   ├── stats/         # Stats dashboards, heatmaps
│   ├── coach/         # Coach-specific components
│   └── common/        # Shared components
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom React hooks
├── lib/               # Firebase config
├── pages/             # Route pages
├── types/             # TypeScript types
├── utils/             # Scoring engine, stats calculator
└── test/              # Test utilities
```

## Scoring System

The app implements **USBC-compliant scoring**:

- **Strikes**: 10 + next 2 balls
- **Spares**: 10 + next 1 ball
- **10th Frame**: 2 balls minimum, 3rd ball awarded on strike/spare
- **Symbols**: X (strike), / (spare), - (miss), F (foul), G (gutter), 0-9 (pins)
- **Split Detection**: USBC-defined splits (headpin down + non-adjacent pins)
- **Pin Leaves**: Tracked for every first ball, with conversion percentages

## Data Model

### Collections

- **users**: User profiles with role (player/coach)
- **players**: Extended player data
- **teams**: Team rosters (5 active + alternates)
- **sessions**: Practice/match events
- **games**: Individual games (10 frames)
- **frames**: Frame data with ball-by-ball details
- **coachNotes**: Private coach notes with tags

### Access Control

- Players can only view/edit their own data
- Coaches can view/edit all data in their program

## Game Modes

### Practice - Spares Only
- Select from common spare drills (10-pin, 7-10 split, etc.)
- Track attempts and conversion rate
- One ball per "frame"

### Practice - Full Game
- Standard 10-frame game
- All stats tracked

### Match - Traditional
- 5 players on team
- Each bowls full game
- Team total = sum of individual scores

### Match - Baker
- 5 players alternate frames
- P1: frames 1,6
- P2: frames 2,7
- P3: frames 3,8
- P4: frames 4,9
- P5: frames 5,10
- Stats attributed to actual thrower

## Testing

Run the test suite:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Deployment

Build and deploy to Firebase Hosting:
```bash
npm run build
firebase deploy
```

## License

MIT
