"use client";

import { useEffect, useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { AUTH_MODAL_ID, switchAuthTab } from "./authModal";
import { consumeAuthIntent } from "@/lib/auth/authIntent";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";

const DEFAULT_SIGNUP_CONFIG = {
  defaultRole: "buyer",
  redirectTo: AUTHENTICATED_HOME,
  intentHint: null,
};

const LoginSignupModal = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [signupConfig, setSignupConfig] = useState(DEFAULT_SIGNUP_CONFIG);

  useEffect(() => {
    const signInTab = document.getElementById("nav-home-tab");
    const signUpTab = document.getElementById("nav-profile-tab");
    const modalEl = document.getElementById(AUTH_MODAL_ID);

    if (!signInTab || !signUpTab) {
      return undefined;
    }

    const onSignIn = () => setActiveTab("signin");
    const onSignUp = () => setActiveTab("signup");
    const onModalShown = () => {
      const intent = consumeAuthIntent();

      if (intent) {
        setSignupConfig({
          defaultRole: intent.role || DEFAULT_SIGNUP_CONFIG.defaultRole,
          redirectTo: intent.next || DEFAULT_SIGNUP_CONFIG.redirectTo,
          intentHint: intent.intentHint || null,
        });

        if (intent.tab) {
          switchAuthTab(intent.tab);
        }
        return;
      }

      setSignupConfig(DEFAULT_SIGNUP_CONFIG);
    };

    signInTab.addEventListener("shown.bs.tab", onSignIn);
    signUpTab.addEventListener("shown.bs.tab", onSignUp);
    modalEl?.addEventListener("shown.bs.modal", onModalShown);

    return () => {
      signInTab.removeEventListener("shown.bs.tab", onSignIn);
      signUpTab.removeEventListener("shown.bs.tab", onSignUp);
      modalEl?.removeEventListener("shown.bs.modal", onModalShown);
    };
  }, []);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalToggleLabel">
          Welcome to Buytly
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        />
      </div>
      {/* End header */}

      <div className="modal-body">
        <div className="log-reg-form">
          <div className="navtab-style2">
            <nav>
              <div className="nav nav-tabs mb20" id="nav-tab" role="tablist">
                <button
                  className="nav-link active fw600"
                  id="nav-home-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-home"
                  type="button"
                  role="tab"
                  aria-controls="nav-home"
                  aria-selected="true"
                >
                  Sign In
                </button>
                <button
                  className="nav-link fw600"
                  id="nav-profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-profile"
                  type="button"
                  role="tab"
                  aria-controls="nav-profile"
                  aria-selected="false"
                >
                  New Account
                </button>
              </div>
            </nav>
            {/* End nav tab items */}

            <div className="tab-content" id="nav-tabContent2">
              <div
                className="tab-pane fade show active fz15"
                id="nav-home"
                role="tabpanel"
                aria-labelledby="nav-home-tab"
              >
                <SignIn showGoogleAuth={activeTab === "signin"} />
              </div>
              {/* End signin content */}

              <div
                className="tab-pane fade fz15"
                id="nav-profile"
                role="tabpanel"
                aria-labelledby="nav-profile-tab"
              >
                <SignUp
                  showGoogleAuth={activeTab === "signup"}
                  defaultRole={signupConfig.defaultRole}
                  redirectTo={signupConfig.redirectTo}
                  intentHint={signupConfig.intentHint}
                />
              </div>
              {/* End signup content */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
