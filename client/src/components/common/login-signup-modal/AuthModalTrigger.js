"use client";

import { openAuthModal } from "./authModal";

const AuthModalTrigger = ({
  tab = "signin",
  as = "button",
  className,
  children,
  ...props
}) => {
  const handleClick = (event) => {
    event.preventDefault();
    openAuthModal(tab);
  };

  if (as === "a") {
    return (
      <a
        href="#"
        className={className}
        onClick={handleClick}
        role="button"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthModalTrigger;
