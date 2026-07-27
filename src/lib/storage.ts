import type { ReviewRecord, StudySession, UserSettings } from '../types/review';
const KEYS = { records: 'sk_review_records', settings: 'sk_user_settings', sessions: 'sk_study_sessions' } as const;
export const defaults: UserSettings = { dailyNewCount: 10, dailyReviewLimit: 30, autoNext: true, showShortcutHint: true };
function read<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function save<T>(key: string, data: T) { localStorage.setItem(key, JSON.stringify(data)); }
export const loadRecords = () => read<Record<string, ReviewRecord>>(KEYS.records, {});
export const saveRecords = (data: Record<string, ReviewRecord>) => save(KEYS.records, data);
export const loadSettings = () => ({ ...defaults, ...read<Partial<UserSettings>>(KEYS.settings, {}) });
export const saveSettings = (data: UserSettings) => save(KEYS.settings, data);
export const loadSessions = () => read<StudySession[]>(KEYS.sessions, []);
export const saveSessions = (data: StudySession[]) => save(KEYS.sessions, data.slice(0, 100));
export const clearAll = () => Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
export const exportData = () => JSON.stringify({ version: 1, records: loadRecords(), settings: loadSettings(), sessions: loadSessions() }, null, 2);
export function importData(raw: string) { const input = JSON.parse(raw) as { records?: unknown; settings?: unknown; sessions?: unknown }; if (!input || typeof input !== 'object' || !input.records || !input.settings || !Array.isArray(input.sessions)) throw new Error('文件格式不正确'); saveRecords(input.records as Record<string, ReviewRecord>); saveSettings({ ...defaults, ...(input.settings as UserSettings) }); saveSessions(input.sessions as StudySession[]); }
