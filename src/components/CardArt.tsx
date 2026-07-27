import type { Category } from '../types/knowledge';

const art: Record<Category, { emoji: string; label: string; color: string }> = {
  法律: { emoji: '⚖', label: '法治常识', color: '#d9e7dc' }, 历史: { emoji: '🏯', label: '华夏史卷', color: '#f1dfbc' }, 人文: { emoji: '📜', label: '人文雅集', color: '#e8dfc9' }, 科技: { emoji: '⚙', label: '求知万象', color: '#dce9ea' }, 地理: { emoji: '⛰', label: '山河地图', color: '#dce8d7' }, 经济: { emoji: '◈', label: '经济脉络', color: '#f4e3c7' }, 政治: { emoji: '✦', label: '政治常识', color: '#eadacb' }, 趣味: { emoji: '🏺', label: '趣味拾光', color: '#e4e3d4' }
};

export function CardArt({ category, compact = false, image }: { category: Category; compact?: boolean; image?: string }) {
  const item = art[category];
  return <div className={`card-art ${compact ? 'compact' : ''} ${image ? 'has-image' : ''}`} style={{ background: item.color }} aria-label={`${category}插画`}>
    {image ? <img src={image} alt={`${category}漫画`} loading="lazy" /> : <><span>{item.emoji}</span><small>{item.label}</small><i>〰</i></>}
  </div>;
}
