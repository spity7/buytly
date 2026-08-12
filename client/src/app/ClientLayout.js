"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import AppToaster from "@/components/common/AppToaster";
import ScrollToTop from "@/components/common/ScrollTop";
import GlobalAuthModal, {
  AuthModalFromQuery,
} from "@/components/common/login-signup-modal/GlobalAuthModal";
import Aos from "aos";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "aos/dist/aos.css";
import "rc-slider/assets/index.css";
import { Suspense, useEffect } from "react";

export default function ClientLayout({ children }) {
  useEffect(() => {
    import("bootstrap");
  }, []);

  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });
  }, []);

  return (
    <QueryProvider>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
      >
        <AuthProvider>
          <div className="wrapper ovh">{children}</div>
          <GlobalAuthModal />
          <Suspense fallback={null}>
            <AuthModalFromQuery />
          </Suspense>
          <ScrollToTop />
          <AppToaster />
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryProvider>
  );
}
