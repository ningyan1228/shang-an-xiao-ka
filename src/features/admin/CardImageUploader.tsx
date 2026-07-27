import { useState } from 'react';
import { prepareCardImages } from '../../lib/images/compressImage';
import { bindCardImages, uploadCardImage } from './adminRepository';

type ImageKind = 'question' | 'answer';
export type ImageBinding = { kind: ImageKind; fullPath: string; thumbnailPath: string };

type Props = {
  slug: string;
  onBound?: (bindings: ImageBinding[]) => void;
};

export function CardImageUploader({ slug, onBound }: Props) {
  const [questionFile, setQuestionFile] = useState<File>();
  const [answerFile, setAnswerFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pickerKey, setPickerKey] = useState(0);

  const uploadOne = async (kind: ImageKind, file: File): Promise<ImageBinding & { warning?: string }> => {
    const images = await prepareCardImages(file);
    const base = `cards/${slug}/${kind}-${Date.now()}`;
    const fullPath = await uploadCardImage(`${base}.webp`, images.full.file);
    const thumbnailPath = await uploadCardImage(`${base}-thumb.webp`, images.thumbnail.file);
    await bindCardImages(slug, kind, fullPath, thumbnailPath);
    return { kind, fullPath, thumbnailPath, warning: images.warning };
  };

  const upload = async () => {
    if (!questionFile && !answerFile) return;
    setBusy(true);
    setMessage('正在压缩、上传并绑定，请稍候…');
    try {
      const bindings: ImageBinding[] = [];
      const warnings: string[] = [];

      // 顺序执行，保证题干图和答案图的数据库绑定都完整写入。
      if (questionFile) {
        const result = await uploadOne('question', questionFile);
        bindings.push(result);
        if (result.warning) warnings.push(result.warning);
      }
      if (answerFile) {
        const result = await uploadOne('answer', answerFile);
        bindings.push(result);
        if (result.warning) warnings.push(result.warning);
      }

      onBound?.(bindings);
      setQuestionFile(undefined);
      setAnswerFile(undefined);
      setPickerKey(current => current + 1);
      setMessage(`上传完成并已绑定：${bindings.map(item => item.kind === 'question' ? '题干漫画' : '答案漫画').join('、')}。${warnings.join(' ')}`);
    } catch (error) {
      setMessage(`上传失败，图片没有绑定：${error instanceof Error ? error.message : '请重试。'}`);
    } finally {
      setBusy(false);
    }
  };

  return <section className="card-image-uploader">
    <h2>给这道题配漫画（可选）</h2>
    <p>先分别选择题干图和答案图，再点击下面的“上传并绑定两张图片”。仅点击“保存知识点”不会上传图片。原图单张最大 2 MB，系统会自动压缩到约 100 KB。</p>
    <div className="form-grid">
      <label>题干漫画（答题前显示）<input key={`question-${pickerKey}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setQuestionFile(event.target.files?.[0])} /></label>
      <label>答案漫画（确认答案后显示）<input key={`answer-${pickerKey}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setAnswerFile(event.target.files?.[0])} /></label>
    </div>
    <button type="button" className="btn ghost" disabled={busy || (!questionFile && !answerFile)} onClick={upload}>{busy ? '正在上传并绑定…' : '上传并绑定所选图片'}</button>
    {message && <p className="form-message">{message}</p>}
  </section>;
}
