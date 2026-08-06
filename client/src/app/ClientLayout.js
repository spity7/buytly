"use client";

import QueryProvider from "@/providers/QueryProvider";
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
      <div className="wrapper ovh">{children}</div>
      <GlobalAuthModal />
      <Suspense fallback={null}>
        <AuthModalFromQuery />
      </Suspense>
      <ScrollToTop />
    </QueryProvider>
  );
}
