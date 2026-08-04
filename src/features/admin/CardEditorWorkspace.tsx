import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CardImageUploader } from './CardImageUploader';
import { getAdminCard, getAdminTopics, saveCard, type AdminCard, type AdminTopic, type CardInput, type OptionKey } from './adminRepository';

const keys: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];
const blankCard = (topicId = ''): CardInput => ({ topic_id: topicId, slug: `card-${Date.now()}`, status: 'draft', question_type: 'choice', question: '', answer: '', explanation: '', mnemonic: null, mistake_tip: null, option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A', correct_options: ['A'], difficulty: 1, is_free: true, sort_order: 0, image_alt: null });
const cardToInput = (card: AdminCard): CardInput => ({ topic_id: card.topic_id, slug: card.slug, status: card.status, question_type: card.question_type, question: card.question, answer: card.answer, explanation: card.explanation, mnemonic: card.mnemonic, mistake_tip: card.mistake_tip, option_a: card.option_a, option_b: card.option_b, option_c: card.option_c, option_d: card.option_d, option_e: card.option_e, correct_option: card.correct_option, correct_options: card.correct_options, difficulty: card.difficulty, is_free: card.is_free, sort_order: card.sort_order, image_alt: card.image_alt, question_image_path: card.question_image_path, answer_image_path: card.answer_image_path, question_thumbnail_path: card.question_thumbnail_path, answer_thumbnail_path: card.answer_thumbnail_path });

export function CardEditorWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [form, setForm] = useState<CardInput>(blankCard());
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminTopics().then(async list => {
      setTopics(list);
      if (!id) { setForm(blankCard(list[0]?.id ?? '')); return; }
      const card = await getAdminCard(id);
      if (!card) throw new Error('未找到该知识点。');
      setForm(cardToInput(card));
    }).catch(error => setMessage(error instanceof Error ? error.message : '读取失败。'));
  }, [id]);

  const set = <K extends keyof CardInput>(key: K, value: CardInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const optionValue = (key: OptionKey) => form[`option_${key.toLowerCase()}` as keyof CardInput] as string | null;
  const changeType = (question_type: CardInput['question_type']) => setForm(current => ({ ...current, question_type, correct_option: question_type === 'choice' ? current.correct_option ?? 'A' : null, correct_options: question_type === 'multiple' ? current.correct_options.length ? current.correct_options : ['A'] : question_type === 'choice' ? [current.correct_option ?? 'A'] : [] }));
  const selectSingle = (key: OptionKey) => setForm(current => ({ ...current, correct_option: key, correct_options: [key] }));
  const toggleMultiple = (key: OptionKey) => setForm(current => ({ ...current, correct_options: current.correct_options.includes(key) ? current.correct_options.filter(item => item !== key) : [...current.correct_options, key] }));

  const save = async (returnToList = false) => {
    setBusy(true); setMessage('');
    try {
      const savedId = await saveCard(form, id);
      setMessage('已保存。');
      if (returnToList) navigate('/admin/cards');
      else if (!id) navigate(`/admin/cards/${savedId}/edit`, { replace: true });
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败。'); }
    finally { setBusy(false); }
  };

  return <section className="admin-workspace editor-workspace">
    <header className="admin-workspace-head editor-head">
      <div><Link className="admin-back" to="/admin/cards">← 返回知识点管理</Link><p className="eyebrow">{id ? '内容编辑' : '快速录题'}</p><h1>{id ? '编辑知识点' : '新建知识点'}</h1><p>先完成题目与解析，再补充漫画。⌘ / Ctrl + Enter 可快速保存。</p></div>
      <div className="editor-state"><span className={`status-pill ${form.status}`}>{form.status === 'published' ? '已上架' : form.status === 'archived' ? '已下架' : '草稿'}</span><small>{id ? '正在编辑已有题目' : '保存后可上传并绑定漫画'}</small></div>
    </header>

    <form onSubmit={event => { event.preventDefault(); void save(); }} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void save(); } }}>
      <div className="editor-layout">
        <main className="editor-main">
          <section className="editor-panel question-panel">
            <div className="panel-title"><span>01</span><div><h2>题目内容</h2><p>题干、选项和正确答案放在一起，录入时不用来回跳。</p></div></div>
            <label className="field-label field-large">题干<textarea autoFocus value={form.question} onChange={event => set('question', event.target.value)} placeholder="请输入完整题干" required /></label>
            {form.question_type !== 'recall' && <div className="option-grid">
              {keys.map(key => <label className={`option-field ${key === 'E' ? 'optional' : ''}`} key={key}><span>选项 {key}{key === 'E' && '（可选）'}</span><input value={optionValue(key) ?? ''} onChange={event => set(`option_${key.toLowerCase()}` as keyof CardInput, event.target.value as never)} required={key !== 'E'} placeholder={`填写选项 ${key}`} /></label>)}
            </div>}
            {form.question_type === 'choice' && <fieldset className="answer-picker"><legend>正确答案</legend>{keys.map(key => <button type="button" key={key} className={form.correct_option === key ? 'selected' : ''} disabled={key === 'E' && !form.option_e} onClick={() => selectSingle(key)}>{key}</button>)}</fieldset>}
            {form.question_type === 'multiple' && <fieldset className="answer-picker"><legend>正确答案（可多选）</legend>{keys.map(key => <button type="button" key={key} className={form.correct_options.includes(key) ? 'selected' : ''} disabled={key === 'E' && !form.option_e} onClick={() => toggleMultiple(key)}>{key}</button>)}</fieldset>}
            {form.question_type === 'recall' && <p className="editor-tip">问答题不需要填写选项；请在下方写出可直接展示给学习者的标准答案与解析。</p>}
          </section>

          <section className="editor-panel">
            <div className="panel-title"><span>02</span><div><h2>答案与讲解</h2><p>学习者确认作答后会看到标准答案、解析和易错提醒。</p></div></div>
            <label className="field-label">标准答案<textarea value={form.answer} onChange={event => set('answer', event.target.value)} placeholder="一句话写清正确答案" required /></label>
            <label className="field-label">答题解析<textarea value={form.explanation} onChange={event => set('explanation', event.target.value)} placeholder="说明为什么正确，也点出常见混淆点" required /></label>
            <div className="editor-two-fields"><label className="field-label">学习讲解 / 记忆口诀<textarea value={form.mnemonic ?? ''} onChange={event => set('mnemonic', event.target.value || null)} placeholder="用通俗的话讲清知识点，不要重复选项" /></label><label className="field-label">易错提醒<textarea value={form.mistake_tip ?? ''} onChange={event => set('mistake_tip', event.target.value || null)} placeholder="例如：不要和……混淆" /></label></div>
          </section>

          <section className="editor-panel image-panel">
            <div className="panel-title"><span>03</span><div><h2>漫画素材</h2><p>漫画可后补；不会影响这道题先保存、先上架。</p></div></div>
            {id ? <><CardImageUploader slug={form.slug} onBound={bindings => setForm(current => bindings.reduce((next, binding) => binding.kind === 'question' ? { ...next, question_image_path: binding.fullPath, question_thumbnail_path: binding.thumbnailPath } : { ...next, answer_image_path: binding.fullPath, answer_thumbnail_path: binding.thumbnailPath }, current))} /><div className="image-status"><span>{form.question_image_path ? '✓ 已绑定题干漫画' : '○ 尚未绑定题干漫画'}</span><span>{form.answer_image_path ? '✓ 已绑定答案漫画' : '○ 尚未绑定答案漫画'}</span></div></> : <p className="editor-tip">先保存本题，系统会生成题目 ID；随后即可在本页上传题干漫画和答案漫画。</p>}
          </section>
        </main>

        <aside className="editor-sidebar">
          <section className="editor-panel publishing-panel">
            <div className="panel-title"><span>设置</span><div><h2>发布设置</h2><p>这些选项会影响题目在前台的呈现。</p></div></div>
            <label className="field-label">专题<select value={form.topic_id} onChange={event => set('topic_id', event.target.value)} required><option value="">请选择专题</option>{topics.map(topic => <option key={topic.id} value={topic.id}>{topic.category_name} · {topic.name}</option>)}</select></label>
            <label className="field-label">题型<select value={form.question_type} onChange={event => changeType(event.target.value as CardInput['question_type'])}><option value="choice">单选题</option><option value="multiple">多选题</option><option value="recall">问答题</option></select></label>
            <div className="editor-two-fields"><label className="field-label">状态<select value={form.status} onChange={event => set('status', event.target.value as CardInput['status'])}><option value="draft">草稿</option><option value="published">已上架</option><option value="archived">已下架</option></select></label><label className="field-label">难度<select value={form.difficulty} onChange={event => set('difficulty', Number(event.target.value) as 1 | 2 | 3)}><option value={1}>简单</option><option value={2}>中等</option><option value={3}>困难</option></select></label></div>
            <div className="editor-two-fields"><label className="field-label">排序<input type="number" value={form.sort_order} onChange={event => set('sort_order', Number(event.target.value))} /></label><label className="field-label">内容权限<select value={String(form.is_free)} onChange={event => set('is_free', event.target.value === 'true')}><option value="true">免费</option><option value="false">会员内容</option></select></label></div>
            <details className="editor-details"><summary>高级标识设置</summary><label className="field-label">题目标识 slug<input value={form.slug} onChange={event => set('slug', event.target.value.trim().toLowerCase())} required /><small>用于 CSV 导入、图片匹配和稳定链接。</small></label></details>
          </section>
        </aside>
      </div>
      <footer className="editor-savebar"><div>{message ? <p className="form-message">{message}</p> : <span>保存后不会丢失已绑定的漫画。</span>}</div><div className="editor-save-actions"><Link className="btn ghost" to="/admin/cards">取消</Link><button className="btn ghost" type="button" disabled={busy} onClick={() => void save(true)}>保存并返回</button><button className="btn primary" disabled={busy}>{busy ? '正在保存…' : id ? '保存知识点' : '创建知识点'}</button></div></footer>
    </form>
  </section>;
}
