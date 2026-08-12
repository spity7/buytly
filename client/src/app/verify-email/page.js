"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is invalid or missing.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await buytlyApi.verifyEmail({ token });
        if (!cancelled) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(getApiError(err));
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="our-compare pt60 pb60">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto">
              <div className="log-reg-form default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white text-center">
                <h2 className="title mb20">Email Verification</h2>

                {status === "loading" ? (
                  <div className="py30">
                    <div className="spinner-border text-thm" role="status">
                      <span className="visually-hidden">Verifying...</span>
                    </div>
                    <p className="mt20 mb0">Verifying your email...</p>
                  </div>
                ) : null}

                {status === "success" ? (
                  <div className="alert alert-success" role="alert">
                    {message}
                  </div>
                ) : null}

                {status === "error" ? (
                  <div className="alert alert-danger" role="alert">
                    {message}
                  </div>
                ) : null}

                {status !== "loading" ? (
                  <p className="mb0 mt20">
                    <Link href="/?auth=signin">Go to sign in</Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
