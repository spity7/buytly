"use client";

import Toaster from "@/components/block57/ui/Toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Client providers for the public Block 57 site. Deliberately lighter than the
 * `(app)` ClientLayout: no Bootstrap JS, AOS, auth modal or live polling; its
 * own Block 57-styled toaster.
 */
export default function SiteProviders({ children }) {
  return (
    <QueryProvider liveSync={false}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}
