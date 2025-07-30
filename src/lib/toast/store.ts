import { SvelteSubject } from '$lib/helpers/rxjs.helper';

/* ---------- internal state ---------- */
const _toasts$ = new SvelteSubject<App.ToastData[]>([]);

/* ---------- public observable ---------- */
export const toasts$ = _toasts$.asObservable();

/* ---------- helpers ---------- */
let nextId = 0;

function _add(
  message: string,
  variant: App.ToastVariant,
  opts?: { duration?: number; pauseOnHover?: boolean }
) {
  const id = Symbol(++nextId);
  const duration = opts?.duration ?? 4000;
  const pauseOnHover = opts?.pauseOnHover ?? true;

  const toast: App.ToastData = {
    id,
    message,
    variant,
    duration,
    pauseOnHover,
    createdAt: Date.now(),
    remaining: duration
  };

  // prepend new toast
  const updated = [toast, ..._toasts$.value];
  _toasts$.next(updated);

  if (duration > 0) {
    toast._timer = setTimeout(() => remove(id), duration);
  }
}

export function remove(id: symbol) {
  const list = _toasts$.value.filter((t) => t.id !== id);
  const old = _toasts$.value.find((t) => t.id === id);
  if (old?._timer) clearTimeout(old._timer);
  _toasts$.next(list);
}

/* ---------- one-liner API ---------- */
export const toast = {
  info: (m: string, o?: Parameters<typeof _add>[2]) => _add(m, 'info', o),
  success: (m: string, o?: Parameters<typeof _add>[2]) => _add(m, 'success', o),
  warning: (m: string, o?: Parameters<typeof _add>[2]) => _add(m, 'warning', o),
  error: (m: string, o?: Parameters<typeof _add>[2]) => _add(m, 'error', o),
  remove
};
