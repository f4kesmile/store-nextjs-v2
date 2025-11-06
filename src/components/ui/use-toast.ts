"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
};

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let queue: ToastItem[] = [];

export function toast(props: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2);
  const item: ToastItem = { id, title: props.title || "", description: props.description || "" };
  queue = [item, ...queue].slice(0, 3);
  for (const l of listeners) l(queue);
  setTimeout(() => dismiss(id), 5000);
  return { id };
}

export function dismiss(id?: string) {
  queue = id ? queue.filter((t) => t.id !== id) : [];
  for (const l of listeners) l(queue);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(queue);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id}>
          {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
          {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
