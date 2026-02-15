# 🚀 Spaced Repetition Study System - Setup Guide

A modern web application for managing study content using spaced repetition methodology, built with Angular 21, Firebase, and Angular Material.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v11 or higher)
- A Firebase account (free tier is sufficient)

## 🔧 Setup Instructions

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable Firestore Database:
   - Go to **Build > Firestore Database**
   - Click **Create Database**
   - Start in **Test Mode** (for development)
   - Choose a location close to you

4. Get your Firebase configuration:
   - Go to **Project Settings** (gear icon)
   - Scroll down to **Your apps**
   - Click **Web** icon (</>) to add a web app
   - Register your app (e.g., "Spaced Rep")
   - Copy the `firebaseConfig` object

5. Update the environment files:
   - Open `src/environments/environment.ts`
   - Replace the placeholder values with your Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

   - Do the same for `src/environments/environment.prod.ts`

### 3. Configure Firestore Security Rules

For development, you can use these permissive rules. **Important:** Update these for production!

1. Go to **Firestore Database > Rules** in Firebase Console
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

⚠️ **Warning:** These rules allow anyone to read/write. For production, implement proper authentication and security rules.

### 4. Run the Application

```bash
npm start
```

The app will be available at [http://localhost:4200](http://localhost:4200)

## 🎯 Features

- ✅ Subject management (Create, Read, Update, Delete)
- ✅ Content management within subjects
- ✅ Spaced repetition algorithm (intervals: 1, 3, 7, 15, 30 days)
- ✅ Study tracking with history
- ✅ Review dashboard with tabs:
  - **Today**: Content due for review today
  - **Overdue**: Content past due date
  - **All**: Complete content list
- ✅ Status indicators:
  - 🟢 On Track
  - 🟡 Due Today
  - 🔴 Overdue
  - 🔵 Completed (max review level)
- ✅ Responsive design (mobile-first)
- ✅ Material Design UI

## 📁 Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── subjects/
│   │   │   ├── subject.service.ts
│   │   │   ├── subjects.component.ts
│   │   │   ├── subject-detail.component.ts
│   │   │   └── subject-form-dialog.component.ts
│   │   ├── contents/
│   │   │   ├── content.service.ts
│   │   │   └── content-form-dialog.component.ts
│   │   └── review/
│   │       └── review.component.ts
│   ├── infra/
│   │   └── firebase.service.ts
│   ├── shared/
│   │   ├── models/
│   │   │   ├── subject.model.ts
│   │   │   └── content.model.ts
│   │   ├── components/
│   │   │   └── confirm-dialog.component.ts
│   │   └── utils/
│   │       └── spaced-repetition.util.ts
│   ├── app.ts
│   ├── app.html
│   ├── app.config.ts
│   └── app.routes.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## 🔥 Firestore Collections

### `subjects`
```typescript
{
  id: string
  name: string
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `contents`
```typescript
{
  id: string
  subjectId: string
  title: string
  description?: string
  reviewLevel: number
  nextReviewDate: Timestamp
  studyHistory: [{ date: Timestamp }]
  totalReviews: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## 🎓 How to Use

1. **Create Subjects**: Organize your study materials by topic (e.g., "Mathematics", "Spanish")
2. **Add Content**: Create specific content items within each subject (e.g., "Quadratic Equations", "Common Phrases")
3. **Study**: When you review content, click "Studied Today"
4. **Track Progress**: The app automatically schedules your next review based on spaced repetition
5. **Review Dashboard**: Check the Review page to see what needs attention

## 🛠️ Build for Production

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

## 📝 Next Steps (Future Enhancements)

- [ ] Google Authentication
- [ ] Advanced SM-2 algorithm
- [ ] Performance statistics and charts
- [ ] Weekly dashboard
- [ ] PWA offline support
- [ ] Push notifications
- [ ] Gamification features

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in environment files
- Check Firestore rules are set correctly
- Ensure Firestore is enabled in Firebase Console

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that you're using Node v18+: `node --version`

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Questions?** Check the requirements document in `.github/requirements.md` for detailed specifications.
