import Image from "next/image";
import Link from "next/link";
import { getAsset } from "@/lib/block57/assets";
import styles from "./Logo.module.scss";

const LOGOS = { light: getAsset("img-001"), dark: getAsset("img-002") };

/**
 * Block 57 Cantonment wordmark linking home.
 * `variant`: "light" (white lettering, for the dark heroes) or "dark" (black
 * lettering, for light backgrounds such as the mobile drawer). The parent
 * sets the width (`--b57-logo-width` or a width on `className`).
 */
export default function Logo({
  variant = "light",
  className,
  priority = false,
  onClick,
}) {
  const logo = LOGOS[variant] ?? LOGOS.light;
  return (
    <Link
      href="/"
      className={[styles.logo, className].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        sizes="(max-width: 767px) 134px, 280px"
        priority={priority}
        className={styles.image}
      />
    </Link>
  );
}
