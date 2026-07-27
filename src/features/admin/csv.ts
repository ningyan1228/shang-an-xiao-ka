export const csvHeaders = ['category_slug', 'topic_slug', 'slug', 'status', 'question_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'correct_option', 'correct_options', 'answer', 'explanation', 'mnemonic', 'mistake_tip', 'difficulty', 'is_free', 'sort_order', 'question_image_filename', 'answer_image_filename'] as const;
const headerAliases: Record<(typeof csvHeaders)[number], string[]> = {
  category_slug: ['category_slug', '分类标识'], topic_slug: ['topic_slug', '专题标识'], slug: ['slug', '题目标识'], status: ['status', '状态'], question_type: ['question_type', '题型'], question: ['question', '题干'], option_a: ['option_a', '选项A'], option_b: ['option_b', '选项B'], option_c: ['option_c', '选项C'], option_d: ['option_d', '选项D'], option_e: ['option_e', '选项E'], correct_option: ['correct_option', '正确选项（单选）'], correct_options: ['correct_options', '正确选项（多选）'], answer: ['answer', '标准答案'], explanation: ['explanation', '解析'], mnemonic: ['mnemonic', '记忆口诀'], mistake_tip: ['mistake_tip', '易错提醒'], difficulty: ['difficulty', '难度'], is_free: ['is_free', '是否免费'], sort_order: ['sort_order', '排序'], question_image_filename: ['question_image_filename', '题干图片文件名'], answer_image_filename: ['answer_image_filename', '答案图片文件名']
};
export type ImportRow = Record<(typeof csvHeaders)[number], string> & { line: number; error?: string };

function parseCsvLine(line: string) {
  const columns: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { columns.push(value.trim()); value = ''; }
    else value += char;
  }
  columns.push(value.trim());
  return columns;
}

export function parseCsv(text: string): ImportRow[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]);
  const indexFor = (key: (typeof csvHeaders)[number]) => header.findIndex(value => headerAliases[key].includes(value));
  return lines.slice(1).map((line, index) => {
    const columns = parseCsvLine(line);
    const row = Object.fromEntries(csvHeaders.map(key => [key, columns[indexFor(key)] ?? ''])) as unknown as ImportRow;
    row.line = index + 2;
    const errors: string[] = [];
    if (!row.category_slug || !row.topic_slug || !row.slug || !row.question || !row.answer || !row.explanation) errors.push('缺少必填字段');
    if (!['draft', 'published', 'archived'].includes(row.status)) errors.push('状态无效');
    if (!['choice', 'multiple', 'recall'].includes(row.question_type)) errors.push('题型无效');
    if (row.question_type === 'choice' && !['A', 'B', 'C', 'D', 'E'].includes(row.correct_option)) errors.push('单选题正确选项无效');
    if (row.question_type === 'multiple' && (!row.correct_options || row.correct_options.split('|').some(option => !['A', 'B', 'C', 'D', 'E'].includes(option)))) errors.push('多选题正确选项填写 A|C|E 这类格式');
    if (!['1', '2', '3'].includes(row.difficulty)) errors.push('难度必须为 1/2/3');
    row.error = errors.join('；') || undefined;
    return row;
  });
}
export function matchImageFilename(name: string) { const match = name.match(/^(.+)-(question|answer)\.(png|jpe?g|webp)$/i); return match ? { slug: match[1], kind: match[2] as 'question' | 'answer' } : null; }
