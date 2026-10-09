import Link from "next/link";
import { ArrowRightBtnIcon } from "./icons";
import VisuallyHidden from "./VisuallyHidden";
import styles from "./Button.module.scss";

/**
 * Live block-57.com buttons (URW 12/24, 2px tracking, uppercase, .3s).
 *
 * variant:
 * - "outlineThin"   transparent, 1px white border + glow, 141×48 (header BROCHURE)
 * - "outlineThick"  transparent, 3px white border, 200×76 → 160×60 ≤767 (hero LEARN MORE)
 * - "white"         white pill, black text, 121×46 (header INQUIRE)
 * - "whiteBordered" white pill + 1px #E3DCD9 border, 200×48 → 180×42 ≤767 (SCHEDULE A TOUR)
 * - "black"         black pill, white text (Penthouse INQUIRE)
 * - "green"         #346054 → #1E443A, 136×50, double-arrow "conveyor" (SUBMIT)
 * - "textLink"      black text over a 1px bar that wipes out and back in on hover
 * size: "md" (live sizes) | "sm" (green pill in the availability table, padding 8/20).
 * arrow: the green variant shows the arrow unless `arrow={false}`; other
 *   variants only with `arrow`.
 */
function buttonClassName({ variant, size, block, className }) {
  return [
    styles.button,
    styles[variant],
    size === "sm" ? styles.small : null,
    block ? styles.block : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function Content({ variant, arrow, icon, children }) {
  const showArrow = arrow ?? variant === "green";
  return (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {showArrow ? (
        <ArrowRightBtnIcon
          size={16}
          className={styles.arrow}
          pathClassNames={[styles.arrowOut, styles.arrowIn]}
        />
      ) : null}
    </>
  );
}

/** <button>. Defaults to type="button". */
export function Button({
  variant = "green",
  size = "md",
  block = false,
  arrow,
  icon,
  type = "button",
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, block, className })}
      {...rest}
    >
      <Content variant={variant} arrow={arrow} icon={icon}>
        {children}
      </Content>
    </button>
  );
}

const EXTERNAL_HREF = /^(https?:|mailto:|tel:|\/\/)/i;

/**
 * Link styled as a button. Internal paths use next/link (write them with the
 * trailing slash: "/inquire/"); tel:, mailto: and http(s) URLs use <a>.
 * `external` opens in a new tab with rel="noopener noreferrer".
 */
export function ButtonLink({
  href,
  variant = "green",
  size = "md",
  block = false,
  arrow,
  icon,
  external = false,
  className,
  children,
  ...rest
}) {
  const classes = buttonClassName({ variant, size, block, className });
  const content = (
    <Content variant={variant} arrow={arrow} icon={icon}>
      {children}
    </Content>
  );

  if (EXTERNAL_HREF.test(String(href)) || external) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
        {external ? (
          <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
        ) : null}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

export default Button;
