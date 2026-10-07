import DefaultHeader from "@/components/common/DefaultHeader";
import AccountFooter from "@/components/common/AccountFooter";
import MobileMenu from "@/components/common/mobile-menu";
import AuthEntryPanel, {
  AuthEntryPanelFallback,
} from "@/components/pages/auth/AuthEntryPanel";
import { pageMetadata } from "@/lib/siteMetadata";
import { Suspense } from "react";

export const metadata = pageMetadata("Login");

// Full-page auth entry (AUTH_ENTRY_PATH): `?auth=signin|signup&next=…`.
export default function Login() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="our-compare pt60 pb60">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto">
              <div className="log-reg-form default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white">
                <Suspense fallback={<AuthEntryPanelFallback />}>
                  <AuthEntryPanel />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AccountFooter />
    </>
  );
}
