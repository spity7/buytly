/** Shared copy and metadata for single vs compound project type. */
export const PROJECT_KIND_INTRO_DESCRIPTION =
  "Single projects hold exactly one sellable unit (Villa type). Compound projects group one or more units on one development page.";

export const PROJECT_KIND_FORM_DESCRIPTION =
  "Single allows one Villa unit. Compound allows one or more units of any catalog property type.";

export const PROJECT_KIND_OPTIONS = [
  {
    value: "single",
    label: "Single",
    hint: "Exactly one sellable unit—the unit is listed as type Villa",
    iconClass: "flaticon-home",
  },
  {
    value: "compound",
    label: "Compound",
    hint: "One or more units—any property types from the catalog",
    iconClass: "flaticon-corporation",
  },
];

export function getProjectKindLabel(kind) {
  const match = PROJECT_KIND_OPTIONS.find((option) => option.value === kind);
  return match?.label || "Single";
}
