# 📘 Specification Document

## Spaced Repetition Study System

---

## 1️⃣ Overview

### Objective

Develop a responsive web application for study management based on **spaced repetition**, allowing users to:

* Organize content by subjects
* Track study sessions
* Automatically calculate next review dates
* Identify overdue content

---

## 2️⃣ Technology Stack

### Frontend

* Angular 21
* Angular Material (UI components)
* Tailwind CSS
* RxJS
* TypeScript

### Backend / Persistence

* Firebase
* Firestore (NoSQL database)
* Firebase Hosting (optional)

> Authentication will NOT be implemented in the initial version.

---

## 3️⃣ Spaced Repetition Concept

Initial simple interval model:

| Review | Interval |
| ------ | -------- |
| 1st    | 1 day    |
| 2nd    | 3 days   |
| 3rd    | 7 days   |
| 4th    | 15 days  |
| 5th    | 30 days  |

Each time a user registers a study:

* Increment `reviewLevel`
* Calculate `nextReviewDate`
* Register history entry

---

# 📦 4️⃣ Data Model (Firestore)

---

## 📁 Collection: `subjects`

```ts
{
  id: string
  name: string
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 📁 Collection: `contents`

```ts
{
  id: string
  subjectId: string
  title: string
  description?: string
  reviewLevel: number
  nextReviewDate: Timestamp
  studyHistory: [
    {
      date: Timestamp
    }
  ]
  totalReviews: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

# 🧠 5️⃣ Business Rules

---

## Register Study

When the user clicks **“Studied Today”**:

1. Increment `reviewLevel`
2. Increment `totalReviews`
3. Append new entry to `studyHistory`
4. Calculate new `nextReviewDate`

---

# 📱 6️⃣ Use Cases

---

## 6.1 Create Subject

* Name (required)
* Description (optional)
* Validation: unique name

---

## 6.2 Edit Subject

* Update name
* Update description
* Update `updatedAt`

---

## 6.3 Delete Subject

* Remove subject
* Remove all associated contents (batch delete)
* Ask UI confirmation 
---

## 6.4 List Subjects

Display:

* Subject name
* Total contents
* Total overdue contents

---

## 6.5 Create Content
Inside Subject we can create new contents

Fields:

* Title
* Description

Initialize:

```ts
reviewLevel = 0
nextReviewDate = today + 1 day
totalReviews = 0
```

---

## 6.6 Edit Content

* Update title
* Update description
* Update associated subject

---

## 6.7 Delete Content

* Remove document from `contents` collection

---

## 6.8 Register Study

Button:

🟢 “Studied Today”

Updates:

* `reviewLevel++`
* `nextReviewDate`
* `studyHistory`
* `totalReviews++`

---

## 6.9 List Content Due Today

Firestore query:

```ts
where('nextReviewDate', '<=', today)
```

Ordered by:

```ts
orderBy('nextReviewDate', 'asc')
```

---

## 6.10 List Overdue Content

Same query as above, but:

```ts
nextReviewDate < today
```

Display badge:

🔴 Overdue by X days

---

## 6.11 Display Content Progress

Show:

* Total reviews completed → `totalReviews`
* Remaining reviews → based on interval array limit
* Next review date
* Study history (dates)

Example:

```
Reviews completed: 3
Next review: Feb 15
Remaining reviews: 2
```

---

# 🧱 7️⃣ Angular Architecture

Suggested structure:

```
/infra
  firebase.service.ts

/features
  /subjects
  /contents
  /review

/shared
  components
  models
```

---

## Services

### SubjectService

* getAll()
* create()
* update()
* delete()

### ContentService

* getBySubject()
* create()
* update()
* delete()
* registerStudy()
* getDueToday()
* getOverdue()

---

# 🎨 8️⃣ Responsive UI Requirements

* Mobile-first approach
* Card layout for contents
* Large “Studied” button
* Filter by subject
* Tabs:

  * Today
  * Overdue
  * All

---

# 📊 9️⃣ System States

Content status:

* 🟢 On track
* 🟡 Due today
* 🔴 Overdue
* 🔵 Completed (max review level reached)

---

# 🔒 10️⃣ Security (Temporary Rules)

Since there is no authentication:

```js
allow read, write: if true;
```

> This is temporary and must be updated when authentication is implemented.

---

# 🚀 11️⃣ Future Improvements

* Google Authentication
* Full SM-2 algorithm implementation
* Performance statistics
* Weekly dashboard
* PWA offline mode
* Push notifications
* Gamification features

---

# 📌 12️⃣ MVP Scope

For initial release:

✔ Subject CRUD
✔ Content CRUD
✔ Study registration
✔ Today list
✔ Overdue list
✔ Basic history tracking