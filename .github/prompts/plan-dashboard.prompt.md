# Plan: Create Dashboard Page

Transform the current subjects page into a comprehensive dashboard with overview statistics, quick actions, and activity insights for the spaced repetition app. The dashboard will serve as the landing page with key metrics and navigation to subjects and review features.

## Steps

1. **Create new dashboard component** at `src/app/features/dashboard/dashboard.component.ts` with statistics cards (total subjects, due today, overdue, completed), quick action buttons, and recent activity feed using Tailwind CSS

2. **Create dashboard service** at `src/app/features/dashboard/dashboard.service.ts` to aggregate metrics from `SubjectService` and `ContentService` (computed signals for counts, status breakdowns, recent activity)

3. **Update routing** in `app.routes.ts` to make dashboard the default route (`/`) and move subjects to `/subjects`

4. **Add dashboard navigation** in `app.html` toolbar with home icon linking to new dashboard route

5. **Style dashboard layout** with responsive grid (1 column mobile, 2-3 columns desktop) following existing Material + Tailwind patterns from `subjects.component.ts`

## Further Considerations

1. **Stitch design assets unavailable** - Should I proceed with a design matching existing patterns (Material cards, badge indicators, grid layout), or do you want to manually provide the Stitch mockups first?
- Remove Material UI components and replace with Tailwind CSS following the design mockups.

2. **Charts/visualizations** - Include study progress charts using a library like ng-apexcharts, or keep it simple with just stat cards initially?
- Charts are not necessary, don't include them in the initial implementation. Focus on stat cards and activity feed first.

3. **Recent activity scope** - Show last 5-10 study actions, or last 24 hours only?
- Show the last 5 study actions in the recent activity feed, regardless of time.

## Current Application Context

### Data Models

**Subject Model:**
- id, name, description, createdAt, updatedAt

**Content Model:**
- id, subjectId, title, description, reviewLevel (0-4), nextReviewDate, studyHistory, totalReviews, createdAt, updatedAt
- Status types: on-track, due-today, overdue, completed

### Existing Services

**SubjectService:**
- CRUD operations with signals
- Loads all subjects ordered by name

**ContentService:**
- getDueToday() - contents due today or earlier
- getOverdue() - contents past review date
- markAsStudied() - increments review level, updates next review date
- getContentStatus() - returns status (on-track/due-today/overdue/completed)
- getDaysOverdue() - calculates overdue days

### Spaced Repetition Intervals
- Level 0: 1 day
- Level 1: 3 days
- Level 2: 7 days
- Level 3: 15 days
- Level 4+: 30 days (completed)

### Technology Stack
- Angular 21.1 (standalone components)
- Tailwind CSS 4.1
- Angular Signals for state management
- Firebase Firestore

### Angular Patterns to Follow
- No `standalone: true` needed (default in Angular 21+)
- Use signals for state management
- Use `inject()` for dependency injection
- Use native control flow (`@if`, `@for`, `@switch`)
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Material components for UI consistency
- Tailwind for utility styling
