import { toast } from "sonner";

export function notifySuccess(message) {
  if (!message) {
    return;
  }
  toast.success(message);
}

export function notifyError(message) {
  if (!message) {
    return;
  }
  toast.error(message);
}
