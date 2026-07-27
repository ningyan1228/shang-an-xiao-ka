export const dayKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(date);
export const isDue = (iso?: string) => !!iso && new Date(iso).getTime() <= Date.now();
export const formatDate = (iso?: string) => iso ? new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '尚未安排';
export const addMinutes = (minutes: number) => new Date(Date.now() + minutes * 60000).toISOString();
export const addDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
