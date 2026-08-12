"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

const LogoutButton = ({ as = "button", className, children, ...props }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout();
    router.push("/");
  };

  if (as === "a") {
    return (
      <a
        href="#"
        className={className}
        onClick={handleLogout}
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
      onClick={handleLogout}
      {...props}
    >
      {children}
    </button>
  );
};

export default LogoutButton;
