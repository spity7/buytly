"use client";

import { Toaster } from "sonner";

const AppToaster = () => (
  <Toaster
    position="top-right"
    richColors
    closeButton
    expand
    visibleToasts={4}
    toastOptions={{
      className: "buytly-toast",
      duration: 4500,
    }}
  />
);

export default AppToaster;
