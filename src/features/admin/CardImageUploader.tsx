import { useState } from 'react';
import { prepareCardImages } from '../../lib/images/compressImage';
import { bindCardImages, uploadCardImage } from './adminRepository';

type ImageKind = 'question' | 'answer';

export function CardImageUploader({ slug }: { slug: string }) {
  const [questionFile, setQuestionFile] = useState<File>();
  const [answerFile, setAnswerFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const uploadOne = async (kind: ImageKind, file: File) => {
    const images = await prepareCardImages(file);
    const base = `cards/${slug}/${kind}-${Date.now()}`;
    const fullPath = await uploadCardImage(`${base}.webp`, images.full.file);
    const thumbnailPath = await uploadCardImage(`${base}-thumb.webp`, images.thumbnail.file);
    await bindCardImages(slug, kind, fullPath, thumbnailPath);
    return images.warning;
  };

  const upload = async () => {
    if (!questionFile && !answerFile) return;
    setBusy(true);
    setMessage('');
    try {
      const warnings = await Promise.all([
        questionFile ? uploadOne('question', questionFile) : undefined,
        answerFile ? uploadOne('answer', answerFile) : undefined
      ]);
      setMessage(`漫画已绑定到本题。${warnings.filter(Boolean).join(' ')}`);
      setQuestionFile(undefined);
      setAnswerFile(undefined);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '漫画上传失败。');
    } finally {
      setBusy(false);
    }
  };

  return <section className="card-image-uploader">
    <h2>给这道题配漫画（可选）</h2>
    <p>直接选择图片即可，不用改文件名。每张原图最大 2 MB，系统会自动压缩到约 100 KB 并绑定到当前题目。</p>
    <div className="form-grid">
      <label>题干漫画<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setQuestionFile(event.target.files?.[0])} /></label>
      <label>答案漫画<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setAnswerFile(event.target.files?.[0])} /></label>
    </div>
    <button type="button" className="btn ghost" disabled={busy || (!questionFile && !answerFile)} onClick={upload}>{busy ? '正在上传漫画…' : '上传并自动绑定'}</button>
    {message && <p className="form-message">{message}</p>}
  </section>;
}
