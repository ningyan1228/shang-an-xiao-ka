export type CompressedImage = { file: File; width: number; height: number; bytes: number; previewUrl: string };

const MAX_ORIGINAL_BYTES = 2 * 1024 * 1024;
const TARGET_BYTES = 100 * 1024;

function createWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
}

export async function compressImage(file: File, maxSide: number, minimumSide: number): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) throw new Error('请选择 PNG、JPG 或 WebP 图片。');
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error('原始图片超过 2 MB，已停止上传。');

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('图片读取失败。'));
      element.src = sourceUrl;
    });

    let side = Math.min(maxSide, Math.max(image.naturalWidth, image.naturalHeight));
    let best: { blob: Blob; width: number; height: number } | null = null;

    while (side >= minimumSide) {
      const ratio = side / Math.max(image.naturalWidth, image.naturalHeight);
      const width = Math.max(1, Math.round(image.naturalWidth * ratio));
      const height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('浏览器不支持图片压缩。');
      context.drawImage(image, 0, 0, width, height);

      let low = 0.35;
      let high = 0.82;
      let candidate = await createWebp(canvas, high);
      if (!candidate) throw new Error('图片压缩失败。');

      if (candidate.size > TARGET_BYTES) {
        let largestUnderTarget: Blob | null = null;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const quality = (low + high) / 2;
          const encoded = await createWebp(canvas, quality);
          if (!encoded) throw new Error('图片压缩失败。');
          if (encoded.size > TARGET_BYTES) high = quality;
          else { largestUnderTarget = encoded; low = quality; }
        }
        candidate = largestUnderTarget ?? await createWebp(canvas, 0.35);
        if (!candidate) throw new Error('图片压缩失败。');
      }

      if (!best || candidate.size < best.blob.size) best = { blob: candidate, width, height };
      if (candidate.size <= TARGET_BYTES) break;
      side = Math.floor(side * 0.82);
    }

    if (!best) throw new Error('图片压缩失败。');
    return {
      file: new File([best.blob], file.name.replace(/\.[^.]+$/i, '.webp'), { type: 'image/webp' }),
      width: best.width,
      height: best.height,
      bytes: best.blob.size,
      previewUrl: URL.createObjectURL(best.blob)
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export async function prepareCardImages(file: File) {
  const full = await compressImage(file, 1600, 720);
  const thumbnail = await compressImage(file, 600, 320);
  const total = full.bytes + thumbnail.bytes;
  return {
    full,
    thumbnail,
    warning: full.bytes > TARGET_BYTES || thumbnail.bytes > TARGET_BYTES
      ? '图片内容较复杂，已尽量压缩；其中至少一张仍略大于 100 KB。'
      : undefined,
    total
  };
}
