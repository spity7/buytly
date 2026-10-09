let onAuthFailure = null;
let onAuthenticatedAuthAttempt = null;

export function setOnAuthFailure(callback) {
  onAuthFailure = callback;
}

export function notifyAuthFailure() {
  onAuthFailure?.();
}

export function setOnAuthenticatedAuthAttempt(callback) {
  onAuthenticatedAuthAttempt = callback;
}

export function notifyAuthenticatedAuthAttempt() {
  onAuthenticatedAuthAttempt?.();
}
