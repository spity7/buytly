"use client";

import { createContext, useContext } from "react";
import { switchAuthTab } from "./authModal";

/**
 * Lets an inline auth page (e.g. /login/) handle "Create an account" / "Login"
 * switches itself. Without a provider the Bootstrap modal tabs are switched.
 */
export const AuthTabSwitchContext = createContext(null);

const AuthTabSwitch = ({ tab, className, children }) => {
  const onSwitchTab = useContext(AuthTabSwitchContext);

  return (
    <button
      type="button"
      className={className}
      onClick={() => (onSwitchTab ?? switchAuthTab)(tab)}
    >
      {children}
    </button>
  );
};

export default AuthTabSwitch;
