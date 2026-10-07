import Link from "next/link";
import { ArrowIcon } from "./icons";
import styles from "./Button.module.scss";

/**
 * Variants: "primary" (solid), "secondary" (outline), "text" (link with arrow).
 * Sizes: "md" | "sm". `block` stretches to the container width.
 */
function buttonClassName({
  variant = "primary",
  size = "md",
  block,
  className,
}) {
  return [
    styles.button,
    styles[variant],
    styles[`size-${size}`],
    block ? styles.block : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function Content({ variant, arrow, icon, children }) {
  const showArrow = arrow ?? variant === "text";
  return (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {showArrow ? (
        <span className={styles.arrow}>
          <ArrowIcon size={16} />
        </span>
      ) : null}
    </>
  );
}

/** <button>. Defaults to type="button". */
export function Button({
  variant = "primary",
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
  variant = "primary",
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
