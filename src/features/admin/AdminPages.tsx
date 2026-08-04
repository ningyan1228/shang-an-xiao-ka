import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { bindCardImages, createImportTopics, getAdminCard, getAdminCards, getAdminCategories, getAdminTopics, type AdminCard, type AdminCategory, type AdminTopic, type CardInput, type OptionKey, type TopicInput, estimateUsage, importCards, saveCard, saveTopic, swapTopicOrder, updateCardStatus, uploadCardImage } from './adminRepository';
import { matchImageFilename, parseCsv, type ImportRow } from './csv';
import { getImportTopicName } from './importTopicNames';
import { prepareCardImages } from '../../lib/images/compressImage';
import { CardImageUploader } from './CardImageUploader';
import { QuickCardPage } from './QuickCardPage';
import { CardsWorkspace } from './CardsWorkspace';
import { CardEditorWorkspace } from './CardEditorWorkspace';
import '../../styles/admin-workspace.css';

const blankCard = (topicId = ''): CardInput => ({ topic_id: topicId, slug: `card-${Date.now()}`, status: 'draft', question_type: 'choice', question: '', answer: '', explanation: '', mnemonic: null, mistake_tip: null, option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A', correct_options: ['A'], difficulty: 1, is_free: true, sort_order: 0, image_alt: null });
const blankTopic = (categoryId = ''): TopicInput => ({ category_id: categoryId, name: '', slug: '', description: null, sort_order: 0, is_free: true, is_active: true });
const topicSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const normalizeTopicSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');
const cardToInput = (card: AdminCard): CardInput => ({ topic_id: card.topic_id, slug: card.slug, status: card.status, question_type: card.question_type, question: card.question, answer: card.answer, explanation: card.explanation, mnemonic: card.mnemonic, mistake_tip: card.mistake_tip, option_a: card.option_a, option_b: card.option_b, option_c: card.option_c, option_d: card.option_d, option_e: card.option_e, correct_option: card.correct_option, correct_options: card.correct_options, difficulty: card.difficulty, is_free: card.is_free, sort_order: card.sort_order, image_alt: card.image_alt, question_image_path: card.question_image_path, answer_image_path: card.answer_image_path, question_thumbnail_path: card.question_thumbnail_path, answer_thumbnail_path: card.answer_thumbnail_path });

export function AdminGuard({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) { return isAdmin ? <>{children}</> : <EmptyState title="没有管理权限" description="此区域仅对 Supabase 管理员开放。" to="/account" action="返回账户" />; }
export function AdminHome() {
  return <section className="admin-page beginner-home">
    <p className="eyebrow">新手后台</p>
    <h1>按两步，就能发布一道题</h1>
    <p className="admin-intro">不懂 CSV、slug 或图片命名也没关系。先建专题，再像填表一样添加题目；保存时直接选择漫画图片即可。</p>
    <div className="beginner-steps">
      <Link to="/admin/topics"><span>第 1 步</span><b>先建立一个专题</b><small>例如：航天常识、法律基础、唐诗宋词。</small></Link>
      <Link to="/admin/cards/new"><span>第 2 步</span><b>添加一道题</b><small>题目、答案和漫画都在同一页完成，不用填写 slug。</small></Link>
      <Link to="/admin/cards"><span>已添加题目要修改？</span><b>进入题目管理</b><small>可以修改题干、答案、选项、上下架状态和漫画。</small></Link>
    </div>
    <details className="admin-advanced">
      <summary>已有题库或需要维护？打开高级工具</summary>
      <div className="admin-grid">
        <Link to="/admin/cards">知识点管理</Link>
        <Link to="/admin/import">CSV 批量导入</Link>
        <Link to="/admin/storage">按文件名批量匹配漫画</Link>
        <Link to="/admin/usage-guide">免费额度估算</Link>
      </div>
    </details>
  </section>;
}

export function CardsPage() {
  const [cards, setCards] = useState<AdminCard[]>([]); const [message, setMessage] = useState('');
  const load = () => getAdminCards().then(setCards).catch(error => setMessage(error instanceof Error ? error.message : '读取失败。'));
  useEffect(() => { void load(); }, []);
  return <section className="admin-page"><div className="admin-heading"><div><Link to="/admin">← 返回后台</Link><h1>知识点管理</h1></div><Link className="btn primary" to="/admin/cards/new">新建知识点</Link></div>{message && <p className="form-message">{message}</p>}<div className="table-wrap"><table><thead><tr><th>题目</th><th>专题</th><th>状态</th><th>排序</th><th>操作</th></tr></thead><tbody>{cards.map(card => <tr key={card.id}><td><b>{card.question}</b><small className="admin-muted">{card.slug}</small></td><td>{card.category_name} · {card.topic_name}</td><td><select value={card.status} onChange={async event => { try { await updateCardStatus(card.id, event.target.value as AdminCard['status']); load(); } catch (error) { setMessage(error instanceof Error ? error.message : '更新失败。'); } }}><option value="published">已上架</option><option value="draft">草稿</option><option value="archived">已下架</option></select></td><td>{card.sort_order}</td><td><Link className="table-link" to={`/admin/cards/${card.id}/edit`}>编辑</Link></td></tr>)}</tbody></table></div>{!cards.length && !message && <p className="admin-muted">暂无知识点。</p>}</section>;
}

export function CardEditor() {
  const { id } = useParams(); const navigate = useNavigate(); const [topics, setTopics] = useState<AdminTopic[]>([]); const [form, setForm] = useState<CardInput>(blankCard()); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { getAdminTopics().then(async list => { setTopics(list); if (!id) { setForm(blankCard(list[0]?.id ?? '')); return; } const card = await getAdminCard(id); if (!card) throw new Error('未找到该知识点。'); setForm(cardToInput(card)); }).catch(error => setMessage(error instanceof Error ? error.message : '读取失败。')); }, [id]);
  const set = <K extends keyof CardInput>(key: K, value: CardInput[K]) => setForm(current => ({ ...current, [key]: value })); const toggleCorrectOption = (key: OptionKey) => setForm(current => ({ ...current, correct_options: current.correct_options.includes(key) ? current.correct_options.filter(item => item !== key) : [...current.correct_options, key] }));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setMessage(''); try { const savedId = await saveCard(form, id); setMessage('保存成功。'); if (!id) navigate(`/admin/cards/${savedId}/edit`, { replace: true }); } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败。'); } finally { setBusy(false); } };
  return <section className="admin-page"><Link to="/admin/cards">← 返回知识点管理</Link><h1>{id ? '编辑知识点' : '新建知识点'}</h1><form className="admin-form" onSubmit={submit}><div className="form-grid"><label>专题<select value={form.topic_id} onChange={event => set('topic_id', event.target.value)} required>{topics.map(topic => <option key={topic.id} value={topic.id}>{topic.category_name} · {topic.name}</option>)}</select></label><label>题目标识 slug<input value={form.slug} onChange={event => set('slug', event.target.value.trim().toLowerCase())} placeholder="例如 dongfanghong-2" required /></label><label>状态<select value={form.status} onChange={event => set('status', event.target.value as CardInput['status'])}><option value="published">已上架</option><option value="draft">草稿</option><option value="archived">已下架</option></select></label><label>题型<select value={form.question_type} onChange={event => set('question_type', event.target.value as CardInput['question_type'])}><option value="choice">单选题</option><option value="multiple">多选题</option><option value="recall">问答题</option></select></label><label>难度<select value={form.difficulty} onChange={event => set('difficulty', Number(event.target.value) as 1 | 2 | 3)}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label><label>排序<input type="number" value={form.sort_order} onChange={event => set('sort_order', Number(event.target.value))} /></label></div><label>题干<textarea value={form.question} onChange={event => set('question', event.target.value)} required /></label>{form.question_type !== 'recall' && <><div className="form-grid"><label>选项 A<input value={form.option_a ?? ''} onChange={event => set('option_a', event.target.value)} required /></label><label>选项 B<input value={form.option_b ?? ''} onChange={event => set('option_b', event.target.value)} required /></label><label>选项 C<input value={form.option_c ?? ''} onChange={event => set('option_c', event.target.value)} required /></label><label>选项 D<input value={form.option_d ?? ''} onChange={event => set('option_d', event.target.value)} required /></label><label>选项 E（可不填）<input value={form.option_e ?? ''} onChange={event => set('option_e', event.target.value)} /></label></div>{form.question_type === 'choice' ? <label>正确选项<select value={form.correct_option ?? 'A'} onChange={event => set('correct_option', event.target.value as OptionKey)}><option>A</option><option>B</option><option>C</option><option>D</option><option value="E" disabled={!form.option_e}>E</option></select></label> : <fieldset className="correct-options"><legend>正确选项（可勾选 1-5 个）</legend>{(['A', 'B', 'C', 'D', 'E'] as OptionKey[]).map(key => <label key={key}><input type="checkbox" checked={form.correct_options.includes(key)} disabled={key === 'E' && !form.option_e} onChange={() => toggleCorrectOption(key)} /> {key}</label>)}</fieldset>}</>}<label>标准答案<textarea value={form.answer} onChange={event => set('answer', event.target.value)} required /></label><label>答题解析（确认答案后展示）<textarea value={form.explanation} onChange={event => set('explanation', event.target.value)} required /></label><div className="form-grid"><label>学习讲解 / 记忆口诀（学习页展示）<textarea value={form.mnemonic ?? ''} placeholder="用通俗的话讲清知识点；不要写 A、B、C、D 选项。" onChange={event => set('mnemonic', event.target.value || null)} /></label><label>易错提醒<input value={form.mistake_tip ?? ''} onChange={event => set('mistake_tip', event.target.value || null)} /></label><label>是否免费<select value={String(form.is_free)} onChange={event => set('is_free', event.target.value === 'true')}><option value="true">免费</option><option value="false">非免费</option></select></label></div>{id && <CardImageUploader slug={form.slug} onBound={bindings => setForm(current => bindings.reduce((next, binding) => binding.kind === 'question' ? { ...next, question_image_path: binding.fullPath, question_thumbnail_path: binding.thumbnailPath } : { ...next, answer_image_path: binding.fullPath, answer_thumbnail_path: binding.thumbnailPath }, current))} />}{id && <p className="admin-muted">题干漫画：{form.question_image_path ?? '尚未绑定'}<br />答案漫画：{form.answer_image_path ?? '尚未绑定'}</p>}<button className="btn primary" disabled={busy}>{busy ? '正在保存…' : '保存知识点'}</button>{message && <p className="form-message">{message}</p>}</form></section>;
}

export function TopicsPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]); const [topics, setTopics] = useState<AdminTopic[]>([]); const [form, setForm] = useState<TopicInput>(blankTopic()); const [editing, setEditing] = useState<string | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => Promise.all([getAdminCategories(), getAdminTopics()]).then(([categoryList, topicList]) => { setCategories(categoryList); setTopics(topicList); setForm(current => current.category_id ? current : blankTopic(categoryList[0]?.id ?? '')); }).catch(error => setMessage(error instanceof Error ? error.message : '读取失败。'));
  useEffect(() => { void load(); }, []);
  const edit = (topic: AdminTopic) => { setEditing(topic.id); setForm({ category_id: topic.category_id, name: topic.name, slug: topic.slug, description: topic.description, sort_order: topic.sort_order, is_free: topic.is_free, is_active: topic.is_active }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setMessage(''); const slug = normalizeTopicSlug(form.slug); if (!topicSlugPattern.test(slug)) { setMessage('专题 slug 只能使用小写字母、数字和连字符，例如 beijing-central-axis。'); return; } const duplicate = topics.find(topic => topic.slug === slug && topic.id !== editing); if (duplicate) { setMessage(`专题 slug「${slug}」已被「${duplicate.name}」使用，请换一个。`); return; } setBusy(true); try { await saveTopic({ ...form, slug }, editing ?? undefined); setMessage(editing ? '专题已保存。' : '专题已创建。'); setEditing(null); setForm(blankTopic(categories[0]?.id ?? '')); load(); } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败。'); } finally { setBusy(false); } };
  const move = async (topic: AdminTopic, delta: number) => { const peers = topics.filter(item => item.category_id === topic.category_id).sort((a, b) => a.sort_order - b.sort_order); const next = peers[peers.findIndex(item => item.id === topic.id) + delta]; if (!next) return; try { await swapTopicOrder(topic, next); load(); } catch (error) { setMessage(error instanceof Error ? error.message : '排序失败。'); } };
  return <section className="admin-page"><Link to="/admin">← 返回后台</Link><h1>专题管理</h1><form className="admin-form compact-form" onSubmit={submit}><h2>{editing ? '编辑专题' : '新建专题'}</h2><div className="form-grid"><label>所属分类<select value={form.category_id} onChange={event => setForm(current => ({ ...current, category_id: event.target.value }))} required>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>专题名称<input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required /></label><label>专题 slug（用于 CSV 导入）<input value={form.slug} onChange={event => setForm(current => ({ ...current, slug: normalizeTopicSlug(event.target.value) }))} placeholder="例如 beijing-central-axis" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /><small className="admin-muted">只能填小写字母、数字和连字符；CSV 的 topic_slug 要与这里完全一致。</small></label><label>排序<input type="number" value={form.sort_order} onChange={event => setForm(current => ({ ...current, sort_order: Number(event.target.value) }))} /></label></div><label>说明<textarea value={form.description ?? ''} onChange={event => setForm(current => ({ ...current, description: event.target.value || null }))} /></label><div className="inline-controls"><label><input type="checkbox" checked={form.is_free} onChange={event => setForm(current => ({ ...current, is_free: event.target.checked }))} /> 免费</label><label><input type="checkbox" checked={form.is_active} onChange={event => setForm(current => ({ ...current, is_active: event.target.checked }))} /> 启用</label><button className="btn primary" disabled={busy}>{busy ? '正在保存…' : editing ? '保存专题' : '创建专题'}</button>{editing && <button type="button" className="btn ghost" onClick={() => { setEditing(null); setForm(blankTopic(categories[0]?.id ?? '')); }}>取消编辑</button>}</div></form>{message && <p className="form-message">{message}</p>}<div className="table-wrap"><table><thead><tr><th>分类</th><th>专题</th><th>slug</th><th>状态</th><th>排序</th><th>操作</th></tr></thead><tbody>{topics.map(topic => <tr key={topic.id}><td>{topic.category_name}</td><td>{topic.name}</td><td>{topic.slug}</td><td>{topic.is_active ? '启用' : '停用'}</td><td>{topic.sort_order}</td><td className="topic-actions"><button onClick={() => move(topic, -1)}>↑</button><button onClick={() => move(topic, 1)}>↓</button><button onClick={() => edit(topic)}>编辑</button></td></tr>)}</tbody></table></div></section>;
}

export function ImportPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const validRows = rows.filter(row => !row.error);
  const requiredTopics = Array.from(new Map(validRows.map(row => [`${row.category_slug}:${row.topic_slug}`, { category_slug: row.category_slug, topic_slug: row.topic_slug, name: getImportTopicName(row.topic_slug) }])).values());
  const missingTopics = requiredTopics.filter(required => !topics.some(topic => topic.slug === required.topic_slug));
  const unknownCategories = missingTopics.filter(required => !categories.some(category => category.slug === required.category_slug));
  const loadMetadata = async (): Promise<AdminTopic[]> => {
    const [categoryList, topicList] = await Promise.all([getAdminCategories(), getAdminTopics()]);
    setCategories(categoryList);
    setTopics(topicList);
    return topicList;
  };
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRows(parseCsv(String(reader.result)));
      setMessage('');
      void loadMetadata().catch(error => setMessage(error instanceof Error ? error.message : '无法读取现有专题。'));
    };
    reader.readAsText(file, 'utf-8');
  };
  const createMissingTopics = async () => {
    if (!missingTopics.length) return;
    setBusy(true);
    setMessage('');
    try {
      const created = await createImportTopics(missingTopics, categories, topics);
      await loadMetadata();
      setMessage(`已创建 ${created} 个缺失专题；现在可以确认导入。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '专题创建失败。');
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const latestTopics = await loadMetadata();
      const stillMissing = requiredTopics.filter(required => !latestTopics.some(topic => topic.slug === required.topic_slug));
      if (stillMissing.length) {
        throw new Error(`仍缺少 ${stillMissing.length} 个专题，请先点击“创建缺失专题”。`);
      }
      await importCards(validRows, latestTopics);
      setMessage(`已提交 ${validRows.length} 条知识点。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导入失败。');
    } finally {
      setBusy(false);
    }
  };
  return <section className="admin-page"><Link to="/admin">← 返回后台</Link><h1>CSV 批量导入</h1><p>请使用中文 Excel 模板填写，保存为 CSV UTF-8 后上传。超过 50 条会自动分批导入。</p><a className="btn ghost" href="./templates/上岸小卡-题库导入模板-多选版.xlsx" download>下载中文 Excel 模板（支持多选 / 选项 E）</a><input type="file" accept=".csv,text/csv" onChange={event => upload(event.target.files?.[0])} />{rows.length > 0 && <><div className="import-summary">共 {rows.length} 道题，可导入 {validRows.length} 道，错误 {rows.filter(row => row.error).length} 道。</div>{missingTopics.length > 0 && <div className="form-message"><b>检测到 {missingTopics.length} 个缺失专题。</b><br />{missingTopics.map(topic => `${topic.name}（${topic.topic_slug}）`).join('、')}{unknownCategories.length > 0 ? <p>以下分类不存在，无法自动创建：{unknownCategories.map(topic => topic.category_slug).join('、')}。</p> : <button className="btn primary" disabled={busy} onClick={createMissingTopics}>{busy ? '正在创建专题…' : `创建 ${missingTopics.length} 个缺失专题`}</button>}</div>}<p className="admin-muted">下方仅预览前 {Math.min(rows.length, 100)} 道题；全部 {validRows.length} 道都会在确认后导入。</p><div className="table-wrap"><table><thead><tr><th>题号</th><th>slug</th><th>题目</th><th>检查</th></tr></thead><tbody>{rows.slice(0, 100).map((row, index) => <tr key={row.line}><td>{index + 1}</td><td>{row.slug}</td><td>{row.question}</td><td>{row.error ?? '可导入'}</td></tr>)}</tbody></table></div><button className="btn primary" disabled={busy || !validRows.length || missingTopics.length > 0} onClick={save}>{busy ? '正在导入…' : '确认导入'}</button></>}{message && <p className="form-message">{message}</p>}</section>;
}

export function StoragePage() { const [files, setFiles] = useState<File[]>([]); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const upload = async () => { setBusy(true); const failed: string[] = []; let bound = 0; try { for (const file of files) { const parsed = matchImageFilename(file.name); if (!parsed) { failed.push(`${file.name}（文件名不符合规则）`); continue; } try { const images = await prepareCardImages(file); const base = `cards/${parsed.slug}/${parsed.kind}-${Date.now()}`; const fullPath = await uploadCardImage(`${base}.webp`, images.full.file); const thumbnailPath = await uploadCardImage(`${base}-thumb.webp`, images.thumbnail.file); await bindCardImages(parsed.slug, parsed.kind, fullPath, thumbnailPath); bound += 1; } catch (error) { failed.push(`${file.name}（${error instanceof Error ? error.message : '上传失败'}）`); } } setMessage(`已自动上传并绑定 ${bound} 张漫画。${failed.length ? `未完成：${failed.join('；')}` : ''}`); } finally { setBusy(false); } }; return <section className="admin-page"><Link to="/admin">← 返回后台</Link><h1>批量漫画匹配</h1><p>先创建知识点，再按 <code>题目slug-question.png</code> 或 <code>题目slug-answer.png</code> 命名图片。上传后会自动压缩至约 100 KB、上传并写回对应题目（原图最大 2 MB）。</p><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={event => setFiles(event.target.files ? Array.from(event.target.files) : [])} />{files.length > 0 && <ul>{files.map(file => { const parsed = matchImageFilename(file.name); return <li key={file.name}>{file.name}：{parsed ? `将绑定到 ${parsed.slug}（${parsed.kind === 'question' ? '题干漫画' : '答案漫画'}）` : '文件名不符合规则，将跳过'}</li>; })}</ul>}<button className="btn primary" disabled={busy || !files.length} onClick={upload}>{busy ? '正在压缩、上传并绑定…' : '确认上传并自动绑定'}</button>{message && <p className="form-message">{message}</p>}</section>; }

export function UsagePage() { const [usage, setUsage] = useState<{ cardCount: number; topicCount: number; imageCount: number; bytes: number; average: number } | null>(null); useEffect(() => { estimateUsage().then(setUsage).catch(() => setUsage(null)); }, []); const mb = (value: number) => (value / 1024 / 1024).toFixed(2); return <section className="admin-page"><Link to="/admin">← 返回后台</Link><h1>免费额度用量估算</h1>{usage ? <div className="usage"><p>知识点：<b>{usage.cardCount}</b></p><p>专题：<b>{usage.topicCount}</b></p><p>已读取图片文件：<b>{usage.imageCount}</b></p><p>图片总大小：<b>{mb(usage.bytes)} MB</b></p><p>平均每张：<b>{Math.round(usage.average / 1024)} KB</b></p><p>实际流量和数据库用量请以 Supabase Dashboard 为准。</p></div> : <p>正在读取内容统计，或云端尚未配置。</p>}</section>; }

export function PlaceholderAdmin({ title }: { title: string }) {
  if (title === '知识点管理') return <CardsWorkspace />;
  if (title === '新建知识点') return <QuickCardPage />;
  if (title === '编辑知识点') return <CardEditorWorkspace />;
  if (title === '专题管理') return <TopicsPage />;
  return <EmptyState title={title} description="该功能暂不可用。" />;
}
