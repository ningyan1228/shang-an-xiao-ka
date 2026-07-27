import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
export function EmptyState({title,description,to='/library',action='去题库看看'}:{title:string;description:string;to?:string;action?:string}) { return <div className="empty"><Sparkles size={38}/><h2>{title}</h2><p>{description}</p><Link className="btn primary" to={to}>{action}</Link></div>; }
