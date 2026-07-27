import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { signIn, signOut, signUp } from './authRepository';
import { loadRecords, loadSessions } from '../../lib/storage';
import { Page } from '../../components/Layout';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/', { replace: true });
        return;
      }
      await signUp(email, password, name);
      setMessage('注册成功，请根据邮箱提示完成验证后登录。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败。');
    } finally {
      setBusy(false);
    }
  };
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">云端同步</p><h1>{mode === 'login' ? '欢迎回来' : '创建学习账户'}</h1>
    <p>登录不是开始学习的前提，只用于跨设备保存你的进度。</p>
    {mode === 'register' && <label>昵称<input value={name} onChange={event => setName(event.target.value)} placeholder="小同学" required /></label>}
    <label>邮箱<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
    <label>密码<input type="password" minLength={6} value={password} onChange={event => setPassword(event.target.value)} placeholder="至少 6 位" required /></label>
    {message && <p className="form-message">{message}</p>}
    <button className="btn primary" disabled={busy}>{busy ? '正在处理…' : mode === 'login' ? '登录并同步' : '注册账户'}</button>
    <p>{mode === 'login' ? <>还没有账户？<Link to="/register">去注册</Link></> : <>已有账户？<Link to="/login">去登录</Link></>}</p>
    {mode === 'login' && <small>忘记密码：请在 Supabase Auth 中启用邮件重置后使用。</small>}
  </form></main>;
}

export function AccountPage({ user, role, onMerge }: { user: User | null; role: 'user' | 'admin' | null; onMerge: () => Promise<void> }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return <Page><section className="auth-page"><div className="auth-card"><h1>尚未登录</h1><p>游客模式仍可使用全部基础学习功能。</p><Link className="btn primary" to="/login">登录同步</Link></div></section></Page>;
  const localCount = Object.keys(loadRecords()).length;
  const localSessions = loadSessions().length;
  return <Page><section className="auth-page"><div className="auth-card">
    <p className="eyebrow">我的账户</p><h1>{user.user_metadata.display_name || user.email}</h1><p>{user.email}</p><p>角色：{role === 'admin' ? '管理员' : '普通用户'}</p>
    <div className="actions account-actions"><Link className="btn primary" to="/study">开始今日学习</Link><Link className="btn ghost" to="/library">浏览题库</Link></div>
    {localCount > 0 && <div className="merge-box"><b>检测到本机学习记录</b><p>本地已学习 {localCount} 个知识点，{localSessions} 次学习总结。</p><button className="btn primary" disabled={busy} onClick={async () => { setBusy(true); try { await onMerge(); setMessage('本地记录已合并到云端，本地备份仍然保留。'); } catch (error) { setMessage(error instanceof Error ? error.message : '合并失败，本地记录未删除。'); } finally { setBusy(false); } }}>合并到云端</button></div>}
    {role === 'admin' && <Link to="/admin" className="btn ghost">进入管理员后台</Link>}
    <button className="btn ghost" onClick={async () => { try { await signOut(); setMessage('已退出登录。'); } catch (error) { setMessage(error instanceof Error ? error.message : '退出失败。'); } }}>退出登录</button>
    {message && <p className="form-message">{message}</p>}
  </div></section></Page>;
}
