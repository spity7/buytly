/**
 * Block 57 inline SVG icons. Decorative by default (aria-hidden); give the
 * surrounding button/link an accessible name. Size via `size` (px, = the icon
 * font size on live), colour via `currentColor`.
 *
 * The live glyphs (theme "easto-icon" font, Font Awesome Instagram, Chaty
 * buttons, the double arrow of the green buttons) were extracted to
 * public/images/block57/shared/icons/ and are inlined here.
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

/**
 * Glyph from the theme icon font: 1001-unit em, y axis flipped. `size` is the
 * font size (glyph box height); the width follows the glyph's advance.
 */
function EastoGlyph({ size = 20, advance = 1001, d, className, ...rest }) {
  return (
    <svg
      width={Math.round(((size * advance) / 1001) * 100) / 100}
      height={size}
      viewBox={`0 -1001 ${advance} 1001`}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path transform="scale(1,-1)" d={d} />
    </svg>
  );
}

// ---- Live glyphs ---------------------------------------------------------------

/** Burger (header, 20px white). */
export function BarsIcon(props) {
  return (
    <EastoGlyph
      advance={875.875}
      d="M864.14 778.12H11.73C5.26 778.12 0 783.38 0 789.85V836.77C0 843.25 5.26 848.5 11.73 848.5H864.14C870.62 848.5 875.88 843.25 875.88 836.77V789.85C875.88 783.38 870.62 778.12 864.14 778.12zM864.14 465.31H11.73C5.26 465.31 0 470.56 0 477.04V523.96C0 530.44 5.26 535.69 11.73 535.69H864.14C870.62 535.69 875.88 530.44 875.88 523.96V477.04C875.88 470.56 870.62 465.31 864.14 465.31zM864.14 152.5H11.73C5.26 152.5 0 157.75 0 164.23V211.15C0 217.62 5.26 222.88 11.73 222.88H864.14C870.62 222.88 875.88 217.62 875.88 211.15V164.23C875.88 157.75 870.62 152.5 864.14 152.5z"
      {...props}
    />
  );
}

/** × (drawer and popup close). */
export function TimesIcon(props) {
  return (
    <EastoGlyph
      advance={625.625}
      d="M379.17 500.5L579.68 701.01L621.03 742.36C627.13 748.46 627.13 758.37 621.03 764.47L576.79 808.72C570.69 814.82 560.78 814.82 554.68 808.72L312.81 566.86L70.95 808.74C64.85 814.84 54.94 814.84 48.84 808.74L4.57 764.49C-1.52 758.39 -1.52 748.48 4.57 742.38L246.46 500.5L4.57 258.64C-1.52 252.54 -1.52 242.63 4.57 236.53L48.82 192.28C54.92 186.18 64.83 186.18 70.93 192.28L312.81 434.14L513.33 233.63L554.68 192.28C560.78 186.18 570.69 186.18 576.79 192.28L621.03 236.53C627.13 242.63 627.13 252.54 621.03 258.64L379.17 500.5z"
      {...props}
    />
  );
}

/** Envelope ("sms", home contact strip). */
export function SmsIcon(props) {
  return (
    <EastoGlyph
      d="M709.05 855.01H291.98C166.85 855.01 83.43 792.45 83.43 646.46V354.51C83.43 208.52 166.85 145.96 291.98 145.96H709.05C834.18 145.96 917.6 208.52 917.6 354.51V646.46C917.6 792.45 834.18 855.01 709.05 855.01zM728.63 601.01L598.1 496.75C570.57 474.63 535.53 463.81 500.5 463.81S430.02 474.66 402.9 496.75L272.37 601.01C259.01 611.86 256.94 631.88 267.36 645.21C278.22 658.56 297.8 661.07 311.15 650.21L441.69 545.95C473.38 520.52 527.18 520.52 558.9 545.95L689.44 650.21C702.8 661.07 722.82 658.97 733.23 645.21C744.09 631.85 741.99 611.83 728.63 601.01z"
      {...props}
    />
  );
}

/** Phone with waves ("call-calling", home contact strip). */
export function CallCallingIcon(props) {
  return (
    <EastoGlyph
      d="M734.89 552.65C716.97 552.65 702.76 567.25 702.76 584.77C702.76 600.19 687.34 632.32 661.47 660.25C636.04 687.37 608.08 703.2 584.74 703.2C566.82 703.2 552.61 717.81 552.61 735.33S567.22 767.45 584.74 767.45C626.44 767.45 670.23 744.93 708.61 704.49C744.49 666.54 767.42 619.4 767.42 585.21C767.42 567.29 752.81 552.68 734.89 552.68zM885.45 552.65C867.52 552.65 853.32 567.25 853.32 584.77C853.32 732.83 732.79 852.95 585.15 852.95C567.22 852.95 553.02 867.55 553.02 885.07S567.19 917.6 584.71 917.6C768.24 917.6 917.54 768.3 917.54 584.77C917.54 567.25 902.93 552.65 885.42 552.65zM460.87 377.47L383.7 300.3C367.43 284.03 341.56 284.03 324.89 299.89C320.29 304.49 315.72 308.65 311.12 313.25C268.17 356.64 229.39 402.09 194.76 449.64C160.57 497.18 133.04 544.73 113.02 591.87C93.41 639.42 83.4 684.87 83.4 728.26C83.4 756.63 88.4 783.72 98.41 808.75C108.42 834.18 124.28 857.54 146.36 878.41C173.05 904.69 202.26 917.6 233.11 917.6C244.78 917.6 256.47 915.1 266.89 910.1C277.75 905.09 287.32 897.58 294.83 886.73L391.58 750.34C399.09 739.93 404.5 730.32 408.25 721.16C412.01 712.4 414.1 703.64 414.1 695.73C414.1 685.72 411.19 675.71 405.34 666.1C399.93 656.5 391.99 646.49 381.98 636.48L350.29 603.54C345.69 598.94 343.62 593.53 343.62 586.87C343.62 583.52 344.03 580.61 344.88 577.26C346.13 573.92 347.38 571.41 348.22 568.91C355.73 555.15 368.65 537.22 387.01 515.51C405.78 493.84 425.8 471.72 447.48 449.61C451.64 445.45 456.24 441.25 460.4 437.09C477.07 420.83 477.51 394.14 460.8 377.44zM916.32 236.52C916.32 224.85 914.23 212.74 910.07 201.08C908.81 197.73 907.56 194.41 905.9 191.07C898.8 176.05 889.64 161.88 877.53 148.52C857.11 126 834.58 109.73 809.12 99.32C808.71 99.32 808.28 98.91 807.87 98.91C783.25 88.9 756.57 83.49 727.79 83.49C685.25 83.49 639.8 93.5 591.81 113.93S495.87 161.88 448.32 196.51C432.06 208.61 415.79 220.69 400.37 233.64L536.75 370.03C548.42 361.27 558.87 354.6 567.63 350.01C569.73 349.16 572.23 347.91 575.14 346.66C578.48 345.41 581.8 345 585.55 345C592.65 345 598.07 347.5 602.66 352.1L634.35 383.38C644.77 393.8 654.78 401.75 664.38 406.75C673.99 412.6 683.56 415.51 694.01 415.51C701.92 415.51 710.27 413.85 719.44 410.1S738.21 400.93 748.62 393.83L886.67 295.83C897.52 288.32 905.03 279.56 909.6 269.14C913.76 258.73 916.26 248.28 916.26 236.61z"
      {...props}
    />
  );
}

/** Up arrow (footer back to top, 12px). */
export function ArrowTopIcon(props) {
  return (
    <EastoGlyph
      advance={844.594}
      d="M0 600.6L72.98 530.53L364.93 810.81V0H469.19V810.81L761.14 530.53L834.11 600.6L417.04 1001L-0.03 600.6z"
      {...props}
    />
  );
}

/** + (image tile hover, 16px green). */
export function PlusIcon(props) {
  return (
    <EastoGlyph
      d="M0 563.06H1001V437.94H0V563.06zM437.94 0L437.94 1001L563.06 1001L563.06 0H437.94z"
      {...props}
    />
  );
}

/** Envelope with flap (pre-footer INQUIRE badge, 40px). */
export function MailInboxIcon(props) {
  return (
    <EastoGlyph
      d="M523.68 445.48C509.92 435.72 491.05 435.72 477.29 445.48L129.54 692.13V741.99C129.54 762.45 146.93 779.03 168.39 779.03H832.58C854.04 779.03 871.43 762.45 871.43 741.99V692.13L523.68 445.48zM558.21 401.21L929.3 664.38V741.96C929.3 792.89 886.01 834.15 832.61 834.15H168.42C115.02 834.15 71.73 792.85 71.73 741.96V664.38L442.82 401.21C477.07 376.91 523.99 376.91 558.25 401.21zM866.49 533.41V263.76C866.49 245.93 851.29 231.45 832.61 231.45H168.42C149.74 231.45 134.54 245.93 134.54 263.76V533.41L66.75 581.49V263.79C66.75 210.34 112.36 166.85 168.42 166.85H832.61C888.67 166.85 934.28 210.34 934.28 263.79V581.49L866.49 533.41z"
      {...props}
    />
  );
}

const ARROW_RIGHT_BTN =
  "M18.4 6l-1.68 1.75 6.72 7h-19.44v2.5h19.44l-6.72 7 1.68 1.75 9.6-10-9.6-10z";

/**
 * Double arrow of the green buttons and the EXPLORE circle: two stacked
 * copies, so CSS can run the "conveyor" hover (first path slides out to the
 * right, the second slides in from the left). Style the paths through the
 * `pathClassNames` ([first, second]).
 */
export function ArrowRightBtnIcon({
  size = 16,
  className,
  pathClassNames = [],
  ...rest
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={ARROW_RIGHT_BTN} className={pathClassNames[0]} />
      <path d={ARROW_RIGHT_BTN} className={pathClassNames[1]} />
    </svg>
  );
}

/** Instagram (Font Awesome brands, as rendered by Elementor). */
export function InstagramIcon({ size = 20, className, ...rest }) {
  return (
    <svg
      width={Math.round(size * (448 / 512) * 100) / 100}
      height={size}
      viewBox="0 0 448 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

/** WhatsApp glyph of the floating Chaty button (drawn on a 39-unit circle). */
export function ChatyWhatsAppIcon({ size = 54, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 39 39"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path
        d="M12.98 10.11C12.7 10.78 11.59 11.44 10.75 11.58C10.19 11.71 9.35 11.84 6.84 10.78C3.49 9.45 1.4 6.25 1.26 6.12C1.12 5.85 0 4.39 0 2.93C0 1.46 .84.67 1.12.4C1.4.13 1.81 0 2.23 0H2.65C2.93 0 3.21 0 3.35.53C3.63 1.2 4.33 2.66 4.33 2.79C4.47 2.93 4.47 3.19 4.33 3.33C4.19 3.59 4.19 3.59 3.91 3.86C3.77 3.99 3.63 4.12 3.49 4.39C3.35 4.52 3.21 4.79 3.35 5.06C3.49 5.32 4.19 6.39 5.16 7.18C6.42 8.25 7.4 8.51 7.82 8.78C8.1 8.91 8.38 8.91 8.65 8.65C8.93 8.38 9.21 7.98 9.49 7.58C9.77 7.32 10.05 7.18 10.33 7.32C10.61 7.45 12.28 8.12 12.56 8.38C12.84 8.51 13.12 8.65 13.12 8.78C13.12 8.78 13.12 9.45 12.98 10.11Z"
        transform="translate(12.9597 12.9597)"
        fill="currentColor"
      />
      <path
        d="M.2 23.3L.13 23.49L.32 23.42L5.53 21.69C7.43 22.85 9.47 23.43 11.66 23.43C18.13 23.43 23.43 18.13 23.43 11.66C23.43 5.19 18.13-.1 11.66-.1C5.19-.1-.1 5.19-.1 11.66C-.1 14 .62 16.34 1.93 18.24L.2 23.3ZM5.88 19.88L5.84 19.87L5.8 19.88L2.78 20.84L3.74 17.96L3.76 17.91L3.72 17.86L3.43 17.58C2.28 15.84 1.56 13.82 1.56 11.66C1.56 6.03 6.03 1.56 11.66 1.56C17.29 1.56 21.77 6.03 21.77 11.66C21.77 17.29 17.29 21.77 11.66 21.77C9.64 21.77 7.77 21.19 6.18 20.04L6.18 20.03L6.17 20.03L5.88 19.88Z"
        transform="translate(7.7758 7.77582)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.2"
      />
    </svg>
  );
}

/** Chain link glyph of the floating "Inquire" button (39-unit circle). */
export function ChatyLinkIcon({ size = 54, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 39 39"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <g transform="rotate(-45 19.5 19.5)">
        <rect x="10.2" y="16.3" width="11.6" height="6.4" rx="3.2" />
        <rect x="17.2" y="16.3" width="11.6" height="6.4" rx="3.2" />
      </g>
    </svg>
  );
}

// ---- Generic UI icons (product features) ---------------------------------------

export function PinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
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
