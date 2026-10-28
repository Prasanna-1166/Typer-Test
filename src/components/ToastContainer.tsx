// ============================================================
// TypeMaster — Toast Notification Component
// ============================================================
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'var(--clr-success-500)',
  error: 'var(--clr-error-500)',
  warning: 'var(--clr-warning-500)',
  info: 'var(--clr-primary-500)',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            <Icon size={20} style={{ color: COLORS[toast.type], flexShrink: 0 }} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="btn btn-ghost"
              style={{ padding: '0.25rem', flexShrink: 0 }}
              aria-label="Dismiss notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
