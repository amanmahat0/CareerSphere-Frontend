import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { subscribeToast } from '../../utils/toast';

const ICONS = {
  success: <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />,
  error:   <XCircle     size={18} className="text-red-500   shrink-0 mt-0.5" />,
  info:    <Info        size={18} className="text-blue-500  shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />,
};

const STYLES = {
  success: 'border-green-200 bg-green-50  text-green-800',
  error:   'border-red-200   bg-red-50    text-red-800',
  info:    'border-blue-200  bg-blue-50   text-blue-800',
  warning: 'border-amber-200 bg-amber-50  text-amber-800',
};

const DURATION = 4000;

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, DURATION);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 w-80 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
        transition-all duration-300
        ${STYLES[toast.type] || STYLES.info}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {ICONS[toast.type] || ICONS.info}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="opacity-50 hover:opacity-100 transition-opacity mt-0.5 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const Alert = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts(prev => [...prev, t]);
    });
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
};

export default Alert;
