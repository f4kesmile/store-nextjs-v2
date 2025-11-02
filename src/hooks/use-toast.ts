import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  if (variant === "destructive") {
    sonnerToast.error(title || "Error", {
      description,
    });
  } else {
    sonnerToast.success(title || "Success", {
      description,
    });
  }
};

export { toast as useToast };