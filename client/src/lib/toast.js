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

/** Shows a persistent loading toast. Returns an id to pass to notifyLoadingSuccess/Error. */
export function notifyLoading(message) {
  if (!message) {
    return undefined;
  }
  return toast.loading(message);
}

export function notifyLoadingSuccess(loadingId, message) {
  if (loadingId) {
    toast.success(message, { id: loadingId });
    return;
  }
  notifySuccess(message);
}

export function notifyLoadingError(loadingId, message) {
  if (loadingId) {
    toast.error(message, { id: loadingId });
    return;
  }
  notifyError(message);
}

export function updateLoadingToast(loadingId, message) {
  if (!loadingId || !message) {
    return;
  }
  toast.loading(message, { id: loadingId });
}

export function dismissToast(loadingId) {
  if (loadingId) {
    toast.dismiss(loadingId);
  }
}
