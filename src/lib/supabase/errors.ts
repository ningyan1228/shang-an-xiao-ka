export function supabaseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/row-level security|permission denied/i.test(message)) return '没有权限执行此操作。';
  if (/network|fetch|timeout/i.test(message)) return '云端服务暂时不可用，已切换为本地学习模式。';
  if (/invalid login credentials/i.test(message)) return '邮箱或密码不正确。';
  if (/email not confirmed/i.test(message)) return '请先到邮箱完成验证。';
  return message || '操作未完成，请稍后重试。';
}
