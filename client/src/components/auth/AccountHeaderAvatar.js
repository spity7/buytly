"use client";

import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";
import Image from "next/image";

export function getAccountLabel(user) {
  return user?.firstName || user?.email?.split("@")[0] || "Account";
}

export function AccountHeaderAvatarLoading() {
  return (
    <span
      className="header-auth-link__avatar-wrap header-auth-link__avatar-wrap--loading"
      aria-hidden="true"
    />
  );
}

export default function AccountHeaderAvatar({ user }) {
  const avatarUrl = user?.avatar?.url;

  if (avatarUrl) {
    return (
      <span className="header-auth-link__avatar-wrap header-auth-link__avatar-wrap--photo">
        <Image
          width={80}
          height={80}
          className="header-auth-link__avatar"
          src={avatarUrl}
          alt=""
          sizes="40px"
          unoptimized={isExternalImageSrc(avatarUrl)}
        />
      </span>
    );
  }

  return (
    <span
      className="header-auth-link__avatar-wrap header-auth-link__avatar-wrap--placeholder"
      aria-hidden="true"
    >
      <span className="flaticon-user" />
    </span>
  );
}

export function AccountHeaderAvatarPlaceholder() {
  return (
    <span
      className="header-auth-link__avatar-wrap header-auth-link__avatar-wrap--placeholder"
      aria-hidden="true"
    >
      <span className="flaticon-user" />
    </span>
  );
}
