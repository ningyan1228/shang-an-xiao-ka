import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { prepareCardImages } from '../../lib/images/compressImage';
import { bindCardImages, getAdminTopics, saveCard, type AdminTopic, type CardInput, uploadCardImage } from './adminRepository';

function createSlug() { return `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function emptyCard(topicId = ''): CardInput {
  return {
    topic_id: topicId, slug: createSlug(), status: 'published', question_type: 'choice', question: '', answer: '', explanation: '',
    option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', difficulty: 1, is_free: true, sort_order: 0,
    mnemonic: null, mistake_tip: null, image_alt: null
  };
}

export function QuickCardPage() {
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [form, setForm] = useState<CardInput>(emptyCard());
  const [questionImage, setQuestionImage] = useState<File>();
  const [answerImage, setAnswerImage] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getAdminTopics().then(list => {
      setTopics(list);
      setForm(current => current.topic_id ? current : emptyCard(list[0]?.id ?? ''));
    }).catch(error => setMessage(error instanceof Error ? error.message : '读取专题失败。'));
  }, []);

  const set = <K extends keyof CardInput>(key: K, value: CardInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const uploadImage = async (kind: 'question' | 'answer', file: File, slug: string) => {
    const images = await prepareCardImages(file);
    const base = `cards/${slug}/${kind}-${Date.now()}`;
    const fullPath = await uploadCardImage(`${base}.webp`, images.full.file);
    const thumbnailPath = await uploadCardImage(`${base}-thumb.webp`, images.thumbnail.file);
    await bindCardImages(slug, kind, fullPath, thumbnailPath);
    return images.warning;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await saveCard(form);
      const warnings = await Promise.all([
        questionImage ? uploadImage('question', questionImage, form.slug) : undefined,
        answerImage ? uploadImage('answer', answerImage, form.slug) : undefined
      ]);
      setMessage(`已保存并发布这道题。${questionImage || answerImage ? '漫画也已自动压缩并绑定。' : '你可以下一题再添加漫画。'}${warnings.filter(Boolean).join(' ')}`);
      setQuestionImage(undefined);
      setAnswerImage(undefined);
      setForm(emptyCard(topics[0]?.id ?? ''));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败，请检查必填内容。');
    } finally {
      setBusy(false);
    }
  };

  return <section className="admin-page quick-card-page">
    <Link to="/admin">← 返回后台</Link>
    <p className="eyebrow">新手添加模式</p>
    <h1>添加一道题</h1>
    <p className="admin-intro">只要填题目和答案。漫画直接从电脑选择，不用填写 slug，也不用修改图片文件名。</p>
    {!topics.length && <div className="form-message">你还没有专题。请先去 <Link to="/admin/topics">建立一个专题</Link>，例如“航天常识”。</div>}
    <form className="admin-form" onSubmit={submit}>
      <div className="form-grid">
        <label>这道题属于哪个专题？<select value={form.topic_id} onChange={event => set('topic_id', event.target.value)} required disabled={!topics.length}><option value="">请选择专题</option>{topics.map(topic => <option key={topic.id} value={topic.id}>{topic.category_name} · {topic.name}</option>)}</select></label>
        <label>题型<select value={form.question_type} onChange={event => set('question_type', event.target.value as CardInput['question_type'])}><option value="choice">选择题</option><option value="recall">问答题</option></select></label>
      </div>
      <label>题目<textarea value={form.question} onChange={event => set('question', event.target.value)} placeholder="例如：我国第一颗人造地球卫星叫什么？" required /></label>
      {form.question_type === 'choice' && <div className="form-grid"><label>选项 A<input value={form.option_a ?? ''} onChange={event => set('option_a', event.target.value)} required /></label><label>选项 B<input value={form.option_b ?? ''} onChange={event => set('option_b', event.target.value)} required /></label><label>选项 C<input value={form.option_c ?? ''} onChange={event => set('option_c', event.target.value)} required /></label><label>选项 D<input value={form.option_d ?? ''} onChange={event => set('option_d', event.target.value)} required /></label><label>正确选项<select value={form.correct_option ?? 'A'} onChange={event => set('correct_option', event.target.value as 'A' | 'B' | 'C' | 'D')}><option>A</option><option>B</option><option>C</option><option>D</option></select></label></div>}
      <label>正确答案<textarea value={form.answer} onChange={event => set('answer', event.target.value)} placeholder="例如：东方红一号" required /></label>
      <label>答案解析<textarea value={form.explanation} onChange={event => set('explanation', event.target.value)} placeholder="写给学习者看的解释，帮助记忆。" required /></label>
      <section className="quick-images"><h2>配漫画（可不传）</h2><p>直接从电脑选择图片即可。原图最大 2 MB，系统会自动压缩至约 100 KB 并绑定到这一题。</p><div className="form-grid"><label>题目展示的漫画<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setQuestionImage(event.target.files?.[0])} /></label><label>查看答案后展示的漫画<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setAnswerImage(event.target.files?.[0])} /></label></div></section>
      <details className="admin-advanced"><summary>更多设置（不填也可以）</summary><div className="form-grid"><label>难度<select value={form.difficulty} onChange={event => set('difficulty', Number(event.target.value) as 1 | 2 | 3)}><option value={1}>简单</option><option value={2}>中等</option><option value={3}>困难</option></select></label><label>是否免费<select value={String(form.is_free)} onChange={event => set('is_free', event.target.value === 'true')}><option value="true">免费</option><option value="false">会员内容</option></select></label><label>记忆口诀<input value={form.mnemonic ?? ''} onChange={event => set('mnemonic', event.target.value || null)} /></label><label>易错提醒<input value={form.mistake_tip ?? ''} onChange={event => set('mistake_tip', event.target.value || null)} /></label></div></details>
      <button className="btn primary" disabled={busy || !topics.length}>{busy ? '正在保存和上传…' : '保存并发布这道题'}</button>
      {message && <p className="form-message">{message}</p>}
    </form>
  </section>;
}
