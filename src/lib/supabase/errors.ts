export function supabaseErrorMessage(error: unknown): string {
  const detail = error && typeof error === 'object' ? error as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown; code?: unknown } : undefined;
  const message = error instanceof Error
    ? error.message
    : [detail?.message, detail?.error_description, detail?.details, detail?.hint, detail?.code].find(value => typeof value === 'string' && value.trim()) as string | undefined ?? String(error ?? '');
  if (/row-level security|permission denied/i.test(message)) return '没有权限执行此操作。';
  if (/network|fetch|timeout/i.test(message)) return '云端服务暂时不可用，已切换为本地学习模式。';
  if (/invalid login credentials/i.test(message)) return '邮箱或密码不正确。';
  if (/email not confirmed/i.test(message)) return '请先到邮箱完成验证。';
  return message || '操作未完成，请稍后重试。';
}
