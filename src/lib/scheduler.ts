import type { KnowledgeCard } from '../types/knowledge';
import type { Rating, ReviewRecord, UserSettings } from '../types/review';
import { addDays, addMinutes, isDue } from './date';
export const blankRecord = (cardId: string): ReviewRecord => ({ cardId, status: 'new', reviewCount: 0, correctStreak: 0, mistakeCount: 0, favorite: false });
export function applyRating(previous: ReviewRecord | undefined, cardId: string, rating: Rating): ReviewRecord {
  const record = previous ?? blankRecord(cardId); const reviewCount = record.reviewCount + 1; let correctStreak = record.correctStreak; let mistakeCount = record.mistakeCount; let nextReviewAt: string; let status: ReviewRecord['status'];
  if (rating === 'forgot') { correctStreak = 0; mistakeCount += 1; nextReviewAt = addMinutes(10); status = 'learning'; }
  else { correctStreak += 1; const gaps = rating === 'fuzzy' ? [1, 3, 7, 14] : [3, 7, 14, 30]; const gap = gaps[Math.min(correctStreak - 1, gaps.length - 1)]; nextReviewAt = addDays(gap); status = rating === 'remembered' && correctStreak >= 4 ? 'mastered' : 'reviewing'; }
  return { ...record, reviewCount, correctStreak, mistakeCount, lastRating: rating, lastReviewedAt: new Date().toISOString(), nextReviewAt, status };
}
export function todayQueue(cards: KnowledgeCard[], records: Record<string, ReviewRecord>, settings: UserSettings, source?: 'mistakes' | 'favorites') {
  const pool = source === 'mistakes' ? cards.filter(c => (records[c.id]?.mistakeCount ?? 0) > 0) : source === 'favorites' ? cards.filter(c => records[c.id]?.favorite) : cards;
  const due = pool.filter(c => { const r = records[c.id]; return r && r.status !== 'mastered' && isDue(r.nextReviewAt); }).sort((a,b) => (records[a.id].nextReviewAt ?? '').localeCompare(records[b.id].nextReviewAt ?? '')).slice(0, settings.dailyReviewLimit);
  const seen = new Set(due.map(c => c.id)); const fresh = pool.filter(c => !records[c.id] && !seen.has(c.id)).slice(0, settings.dailyNewCount);
  return [...due, ...fresh];
}
