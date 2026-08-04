import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCardPage, type AdminCard } from './adminRepository';

const pageSize = 25;
const statusLabel: Record<AdminCard['status'], string> = { published: '已上架', draft: '草稿', archived: '已下架' };

export function CardsWorkspace() {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<AdminCard['status'] | 'all'>('all');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getAdminCardPage({ page, pageSize, status, query }).then(result => {
      if (!live) return;
      setCards(result.cards);
      setCount(result.count);
      setMessage('');
    }).catch(error => {
      if (live) setMessage(error instanceof Error ? error.message : '读取题目失败。');
    }).finally(() => {
      if (live) setLoading(false);
    });
    return () => { live = false; };
  }, [page, status, query]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const first = count ? page * pageSize + 1 : 0;
  const last = Math.min((page + 1) * pageSize, count);
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    setQuery(queryInput.trim());
  };

  return <section className="admin-workspace admin-list-workspace">
    <header className="admin-workspace-head">
      <div>
        <Link className="admin-back" to="/admin">← 返回后台</Link>
        <p className="eyebrow">内容管理</p>
        <h1>知识点管理</h1>
        <p>按题干或 slug 快速查找；每次只读取当前页，题目再多也保持轻快。</p>
      </div>
      <Link className="btn primary" to="/admin/cards/new">+ 新建知识点</Link>
    </header>

    <form className="admin-toolbar" onSubmit={submitSearch}>
      <label className="admin-search"><span>搜索</span><input value={queryInput} onChange={event => setQueryInput(event.target.value)} placeholder="题干或 slug" /></label>
      <label><span>状态</span><select value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(0); }}><option value="all">全部状态</option><option value="published">已上架</option><option value="draft">草稿</option><option value="archived">已下架</option></select></label>
      <button className="btn ghost" type="submit">查询</button>
      {(query || status !== 'all') && <button className="text-button" type="button" onClick={() => { setQuery(''); setQueryInput(''); setStatus('all'); setPage(0); }}>清除筛选</button>}
    </form>

    {message && <p className="form-message">{message}</p>}
    <div className="admin-list-meta"><b>{count}</b> 道题目 <span>{loading ? '正在更新…' : count ? `显示 ${first}–${last}` : '暂无符合条件的题目'}</span></div>
    <div className="admin-card-list" aria-busy={loading}>
      {cards.map(card => <article className="admin-card-row" key={card.id}>
        <div className="admin-card-index">{card.question_type === 'multiple' ? '多选' : card.question_type === 'recall' ? '问答' : '单选'}</div>
        <div className="admin-card-content"><b>{card.question}</b><small>{card.category_name} · {card.topic_name}　/　{card.slug}</small></div>
        <div className={`status-pill ${card.status}`}>{statusLabel[card.status]}</div>
        <small className="admin-card-order">排序 {card.sort_order}</small>
        <Link className="btn ghost admin-edit-link" to={`/admin/cards/${card.id}/edit`}>编辑 →</Link>
      </article>)}
      {!loading && !cards.length && <p className="admin-empty">没有找到匹配的题目。</p>}
    </div>
    <footer className="admin-pagination">
      <button className="btn ghost" disabled={page === 0 || loading} onClick={() => setPage(current => current - 1)}>← 上一页</button>
      <span>第 {page + 1} / {totalPages} 页</span>
      <button className="btn ghost" disabled={page + 1 >= totalPages || loading} onClick={() => setPage(current => current + 1)}>下一页 →</button>
    </footer>
  </section>;
}
