"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ChangeHandler = (value: string) => void;

type SelectContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  value?: string;
  onValueChange?: ChangeHandler;
};

const SelectCtx = React.createContext<SelectContextType | null>(null);

export const Select: React.FC<{
  value?: string;
  onValueChange?: ChangeHandler;
  children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);

  // close on escape / outside click
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);

  return (
    <SelectCtx.Provider value={{ open, setOpen, value, onValueChange }}>
      <div className="relative" ref={ref}>{children}</div>
    </SelectCtx.Provider>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectCtx)!;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = React.useContext(SelectCtx)!;
  if (!ctx.open) return null;
  return (
    <div className="absolute z-50 mt-1 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  const ctx = React.useContext(SelectCtx)!;
  return (
    <div
      role="option"
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
      onClick={() => { ctx.onValueChange?.(value); ctx.setOpen(false); }}
    >
      {children}
    </div>
  );
};
