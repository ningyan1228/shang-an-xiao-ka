export type Rating = 'forgot' | 'fuzzy' | 'remembered';
export type Status = 'new' | 'learning' | 'reviewing' | 'mastered';
export type ReviewRecord = { cardId: string; status: Status; lastRating?: Rating; reviewCount: number; correctStreak: number; mistakeCount: number; lastReviewedAt?: string; nextReviewAt?: string; favorite: boolean };
export type UserSettings = { dailyNewCount: 10 | 15 | 20; dailyReviewLimit: 20 | 30 | 50 | 9999; autoNext: boolean; showShortcutHint: boolean };
export type StudySession = { id: string; startedAt: string; completedAt: string; cardIds: string[]; ratings: Rating[] };
