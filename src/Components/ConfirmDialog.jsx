import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Reusable inline confirmation dialog.
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   // trigger: setConfirm({ title, message, onConfirm, danger?, confirmLabel? })
 *   <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
 */
const ConfirmDialog = ({ config, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!config) return null;

  const { title, message, onConfirm, danger = true, confirmLabel = 'Confirm', children } = config;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
            <AlertTriangle size={16} className={danger ? 'text-red-600' : 'text-blue-600'} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {message && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-900 hover:bg-blue-950'
            }`}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
