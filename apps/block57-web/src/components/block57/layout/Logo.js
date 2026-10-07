import Image from "next/image";
import Link from "next/link";
import {
  BRAND_LOGO_DARK,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WHITE,
  BRAND_LOGO_WIDTH,
} from "@/data/brandAssets";
import styles from "./Logo.module.scss";

/**
 * Block 57 wordmark linking home.
 * `variant`: "dark" (on light), "light" (on dark) or "auto" (renders both;
 * the parent's CSS decides which one shows — used by the overlay header).
 */
export default function Logo({
  variant = "dark",
  className,
  onClick,
  imageClassNames = {},
}) {
  const showDark = variant === "dark" || variant === "auto";
  const showLight = variant === "light" || variant === "auto";

  return (
    <Link
      href="/"
      className={[styles.logo, className].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      {showDark ? (
        <Image
          src={BRAND_LOGO_DARK}
          alt="Block 57"
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          loading="eager"
          className={[styles.image, imageClassNames.dark]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
      {showLight ? (
        <Image
          src={BRAND_LOGO_WHITE}
          alt="Block 57"
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          loading="eager"
          className={[styles.image, imageClassNames.light]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
    </Link>
  );
}
