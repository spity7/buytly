"use client";

import { useAuthSafe } from "@/providers/AuthProvider";
import { useFavoriteStatus, useToggleFavorite } from "@/hooks/useFavorites";
import { openAuthModal } from "@/components/common/login-signup-modal/authModal";

export default function FavoriteButton({ propertyId, className = "" }) {
  const auth = useAuthSafe();
  const isAuthenticated = Boolean(auth?.user);
  const { data: isFavorite = false } = useFavoriteStatus(
    propertyId,
    isAuthenticated,
  );
  const toggleFavorite = useToggleFavorite();

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal("signin");
      return;
    }

    toggleFavorite.mutate({ propertyId, isFavorite });
  };

  return (
    <button
      type="button"
      className={`icon border-0 bg-transparent p-0 ${className}`}
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span className={`flaticon-like ${isFavorite ? "text-thm" : ""}`} />
    </button>
  );
}
