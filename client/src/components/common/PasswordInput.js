"use client";

import { useState } from "react";

const PasswordInput = ({
  className = "form-control",
  wrapperClassName = "password-field",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={className}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        tabIndex={-1}
        disabled={props.disabled}
      >
        <i className={isVisible ? "far fa-eye-slash" : "far fa-eye"} />
      </button>
    </div>
  );
};

export default PasswordInput;
