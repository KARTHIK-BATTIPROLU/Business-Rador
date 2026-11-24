'use client';

// Small toast system: one message at a time slot (newest on top, max 3),
// optional single action such as "Undo". Announced politely to screen readers.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type Toast = { id: number; text: string; action?: { label: string; run: () => void }; duration: number };
type ShowToast = (t: { text: string; action?: { label: string; run: () => void }; duration?: number }) => void;

const Ctx = createContext<ShowToast>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    ({ text, action, duration }) => {
      const id = ++seq.current;
      const d = duration ?? (action ? 6000 : 2600);
      setToasts((t) => [{ id, text, action, duration: d }, ...t].slice(0, 3));
      timers.current[id] = setTimeout(() => dismiss(id), d);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        style={{ bottom: 'var(--toast-offset, 0px)' }}
        className="pointer-events-none fixed inset-x-0 z-[70] flex flex-col items-center gap-2 px-3 pb-[max(env(safe-area-inset-bottom),16px)] md:pb-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 460, damping: 36 }}
              role="status"
              className="pointer-events-auto flex items-center gap-3 min-h-12 max-w-[min(92vw,440px)] rounded-panel border border-ink bg-ink text-surface pl-4 pr-1.5 py-1.5 shadow-hard-sm"
            >
              <span className="text-sm">{t.text}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.run();
                    dismiss(t.id);
                  }}
                  className="h-9 px-3 rounded-ctl text-sm font-semibold underline underline-offset-4 decoration-accent-fill decoration-2 hover:bg-surface/10"
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="size-9 grid place-items-center rounded-ctl text-surface/70 hover:text-surface hover:bg-surface/10">
                <X aria-hidden className="size-4 stroke-[1.5]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
