"use client";

import { switchAuthTab } from "./authModal";

const AuthTabSwitch = ({ tab, className, children }) => {
  return (
    <button
      type="button"
      className={className}
      onClick={() => switchAuthTab(tab)}
    >
      {children}
    </button>
  );
};

export default AuthTabSwitch;
