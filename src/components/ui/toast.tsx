"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type Toast = { 
  id: number; 
  title?: string; 
  description?: string; 
  variant?: "default" | "success" | "destructive" 
};

const ToastCtx = createContext<{ 
  toasts: Toast[]; 
  show: (t: Omit<Toast, "id">) => void; 
  remove: (id: number) => void 
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);
  
  const remove = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  return (
    <ToastCtx.Provider value={{ toasts, show, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-[360px] rounded-md border p-4 shadow-lg bg-white transition-all duration-300 animate-in slide-in-from-right-2 ${
              t.variant === "success" 
                ? "border-green-300 bg-green-50 text-green-800" 
                : t.variant === "destructive" 
                ? "border-red-300 bg-red-50 text-red-800" 
                : "border-border"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {t.title && <div className="font-medium mb-1">{t.title}</div>}
                {t.description && <div className="text-sm opacity-80">{t.description}</div>}
              </div>
              <button 
                onClick={() => remove(t.id)}
                className="ml-3 text-lg opacity-50 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.show;
}