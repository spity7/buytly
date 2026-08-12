export const AUTH_MODAL_ID = "loginSignupModal";

export const AUTH_TABS = {
  signin: { buttonId: "nav-home-tab" },
  signup: { buttonId: "nav-profile-tab" },
};

export async function switchAuthTab(tab = "signin") {
  if (typeof window === "undefined") {
    return;
  }

  const { Tab } = await import("bootstrap");
  const tabConfig = AUTH_TABS[tab] ?? AUTH_TABS.signin;
  const tabButton = document.getElementById(tabConfig.buttonId);

  if (tabButton) {
    Tab.getOrCreateInstance(tabButton).show();
  }
}

export async function openAuthModal(tab = "signin") {
  if (typeof window === "undefined") {
    return;
  }

  const { hasActiveSession } = await import("@/lib/auth/session");
  const { notifyAuthenticatedAuthAttempt } =
    await import("@/lib/auth/authCallbacks");

  if (hasActiveSession()) {
    notifyAuthenticatedAuthAttempt();
    return;
  }

  await switchAuthTab(tab);

  const { Modal } = await import("bootstrap");
  const modalEl = document.getElementById(AUTH_MODAL_ID);
  if (modalEl) {
    Modal.getOrCreateInstance(modalEl).show();
  }
}

export async function closeAuthModal() {
  if (typeof window === "undefined") {
    return;
  }

  const { Modal } = await import("bootstrap");
  const modalEl = document.getElementById(AUTH_MODAL_ID);
  if (modalEl) {
    Modal.getOrCreateInstance(modalEl).hide();
  }
}
