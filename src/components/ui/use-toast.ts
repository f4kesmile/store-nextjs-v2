"use client";

import * as React from "react"
import { type ToastActionElement, Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

let listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = { toasts: [] }

interface ToastState { toasts: Toast[] }

type ToastProps = Omit<Toast, "id"> & { id: string }

type ToastHandlers = {
  add: (toast: ToastProps) => void
  update: (toast: Partial<ToastProps>) => void
  dismiss: (toastId?: string) => void
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

export const toastHandlers: ToastHandlers = {
  add: (toast) => {
    memoryState = { toasts: [toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) }
    listeners.forEach((l) => l(memoryState))
    setTimeout(() => toastHandlers.dismiss(toast.id), TOAST_REMOVE_DELAY)
  },
  update: (toast) => {
    memoryState = {
      toasts: memoryState.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)),
    }
    listeners.forEach((l) => l(memoryState))
  },
  dismiss: (toastId) => {
    if (!toastId) memoryState = { toasts: [] }
    else memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== toastId) }
    listeners.forEach((l) => l(memoryState))
  },
}

export function toast(props: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2)
  toastHandlers.add({ id, ...props })
  return { id }
}

export function Toaster(){
  const [state, setState] = React.useState<ToastState>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => { listeners = listeners.filter((l) => l !== setState) }
  }, [])

  return (
    <ToastProvider>
      {state.toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
