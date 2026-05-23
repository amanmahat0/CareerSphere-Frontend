// Global event-based toast system — import toast and call toast.success/error/info/warning
let _id = 0;
const _listeners = [];

const emit = (type, message) => {
  const id = ++_id;
  _listeners.forEach(fn => fn({ id, type, message }));
  return id;
};

export const toast = {
  success: (message) => emit('success', message),
  error:   (message) => emit('error', message),
  info:    (message) => emit('info', message),
  warning: (message) => emit('warning', message),
};

export const subscribeToast = (fn) => {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i > -1) _listeners.splice(i, 1);
  };
};
