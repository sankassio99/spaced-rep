export const SPACED_REPETITION_INTERVALS = [0, 1, 3, 7, 15, 30] as const;

export function calculateNextReviewDate(reviewLevel: number): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const intervalIndex = Math.min(reviewLevel, SPACED_REPETITION_INTERVALS.length - 1);
  const daysToAdd = SPACED_REPETITION_INTERVALS[intervalIndex];
  
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate;
}

export function getDaysOverdue(nextReviewDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - reviewDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}
