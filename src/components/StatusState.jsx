import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const icons = {
  empty: CheckCircle2,
  error: AlertTriangle,
  loading: Loader2,
};

export default function StatusState({ title, message, tone = 'empty' }) {
  const Icon = icons[tone] ?? icons.empty;

  return (
    <div className={`status-state ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        {message ? <span>{message}</span> : null}
      </div>
    </div>
  );
}
