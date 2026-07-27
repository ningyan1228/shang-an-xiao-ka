import { BookOpen, ChartNoAxesColumnIncreasing, Heart, Home, Library, NotebookPen, Settings, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
const links = [{to:'/',label:'首页',icon:Home},{to:'/library',label:'题库',icon:Library},{to:'/study',label:'今日学习',icon:BookOpen},{to:'/mistakes',label:'错题本',icon:NotebookPen},{to:'/favorites',label:'收藏夹',icon:Heart},{to:'/stats',label:'学习数据',icon:ChartNoAxesColumnIncreasing}];
export function AppHeader() { return <header><NavLink className="brand" to="/"><span className="brand-mark">学</span><b>上岸小卡</b><em>考公常识视觉记忆系统</em></NavLink><nav>{links.map(({to,label}) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav><button className="member" onClick={() => alert('会员功能正在准备中。当前核心学习、复习、错题和数据功能均可免费使用。')}>开通会员</button></header>; }
export function MobileBottomNav() { const items = [{to:'/',label:'首页',icon:Home},{to:'/study',label:'学习',icon:BookOpen},{to:'/library',label:'题库',icon:Library},{to:'/mistakes',label:'错题',icon:NotebookPen},{to:'/stats',label:'我的',icon:Settings}]; return <div className="mobile-nav">{items.map(({to,label,icon:Icon}) => <NavLink key={to} to={to}><Icon size={19}/><span>{label}</span></NavLink>)}</div>; }
export function Page({ children }: { children: React.ReactNode }) { return <><AppHeader/><main className="page">{children}</main><MobileBottomNav/></>; }
export const iconFor = { Sparkles };
