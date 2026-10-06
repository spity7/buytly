"use client";

import AppToaster from "@/components/common/AppToaster";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Client providers for the public Block 57 site. Deliberately lighter than the
 * `(app)` ClientLayout: no Bootstrap JS, AOS, auth modal or live polling.
 */
export default function SiteProviders({ children }) {
  return (
    <QueryProvider liveSync={false}>
      <AuthProvider>
        {children}
        <AppToaster />
      </AuthProvider>
    </QueryProvider>
  );
}
