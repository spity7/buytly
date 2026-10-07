/**
 * Block 57 inline SVG icons. Decorative by default (aria-hidden); give the
 * surrounding button/link an accessible name. Size via `size` (px), colour via
 * `currentColor`.
 */

function Svg({ size = 20, strokeWidth = 1.5, children, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5.2 3.5h3l1.5 4.2-2 1.3a12 12 0 0 0 7.3 7.3l1.3-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3.2 5.7a2 2 0 0 1 2-2.2Z" />
    </Svg>
  );
}

export function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="0.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </Svg>
  );
}

export function PinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </Svg>
  );
}

const ARROW_ROTATION = { right: 0, down: 90, left: 180, up: 270 };

export function ArrowIcon({ direction = "right", style, ...props }) {
  const rotation = ARROW_ROTATION[direction] ?? 0;
  return (
    <Svg
      {...props}
      style={
        rotation ? { transform: `rotate(${rotation}deg)`, ...style } : style
      }
    >
      <path d="M4 12h15.5" />
      <path d="m14 6.5 5.5 5.5-5.5 5.5" />
    </Svg>
  );
}

export function ChevronIcon({ direction = "down", style, ...props }) {
  const rotation = { down: 0, left: 90, up: 180, right: 270 }[direction] ?? 0;
  return (
    <Svg
      {...props}
      style={
        rotation ? { transform: `rotate(${rotation}deg)`, ...style } : style
      }
    >
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function HeartIcon({ filled = false, ...props }) {
  return (
    <Svg {...props} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.3s-7.8-4.6-7.8-10.4A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.8 2.7c0 5.8-7.8 10.4-7.8 10.4Z" />
    </Svg>
  );
}

export function WhatsAppIcon({ size = 20, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35Zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88Zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41Z" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 8h17" />
      <path d="M3.5 16h17" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="m5.5 5.5 13 13" />
      <path d="m18.5 5.5-13 13" />
    </Svg>
  );
}

export function UserIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Svg>
  );
}

export function LogoutIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14 4.5H5.5v15H14" />
      <path d="M10 12h10" />
      <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
    </Svg>
  );
}
