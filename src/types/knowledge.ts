export type Category = '法律' | '历史' | '人文' | '科技' | '地理' | '经济' | '政治' | '趣味';
export type KnowledgeCard = { id: string; question: string; answer: string; explanation: string; mnemonic?: string; mistakeTip?: string; category: Category; topic: string; tags: string[]; image?: string; imageAlt?: string; source?: string; difficulty: 1 | 2 | 3 };
