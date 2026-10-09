/** Font Awesome classes for dashboard `.ud-btn` actions (use with {@link DashboardBtnIcon}). */
export const dashboardIcons = {
  add: "fal fa-plus",
  arrowLeft: "fal fa-arrow-left-long",
  arrowRight: "fal fa-arrow-right-long",
  trash: "fas fa-trash-can",
  restore: "fal fa-rotate-left",
  approve: "fas fa-check",
  reject: "fal fa-xmark",
  cancel: "fal fa-ban",
  archive: "fal fa-box-archive",
  edit: "fas fa-pen",
  eye: "far fa-eye",
  external: "fal fa-external-link",
  submit: "fal fa-paper-plane",
  save: "fal fa-floppy-disk",
  draft: "fal fa-file-lines",
  clear: "fal fa-times",
  list: "fal fa-list-ul",
  building: "fal fa-building",
  folderPlus: "fal fa-folder-plus",
  complete: "fas fa-circle-check",
  send: "fal fa-paper-plane",
  retry: "fal fa-arrows-rotate",
  chevronLeft: "fal fa-chevron-left",
  chevronRight: "fal fa-chevron-right",
  review: "fal fa-clipboard-check",
  userActivate: "fas fa-user-check",
  userDeactivate: "fas fa-user-slash",
  heart: "fal fa-heart",
  search: "fal fa-magnifying-glass",
  browse: "fal fa-compass",
  chart: "fal fa-chart-line",
  bell: "fal fa-bell",
};

/**
 * Icon for dashboard buttons. Theme `.ud-btn > i` applies rotate(-45deg) to all icons;
 * this component resets rotation except for `trailArrow` (forward CTA arrows).
 *
 * @param {object} props
 * @param {string} props.icon — FA class string (see {@link dashboardIcons})
 * @param {"lead"|"trail"|"trailArrow"} [props.position="lead"]
 */
export default function DashboardBtnIcon({ icon, position = "lead" }) {
  const positionClass =
    position === "trailArrow"
      ? "dashboard-btn-icon--trail-arrow"
      : position === "trail"
        ? "dashboard-btn-icon--trail"
        : "dashboard-btn-icon--lead";

  return (
    <i
      className={`dashboard-btn-icon ${positionClass} ${icon}`}
      aria-hidden="true"
    />
  );
}
