export function hasFormChanges(current, baseline) {
  if (!baseline) {
    return false;
  }

  return JSON.stringify(current) !== JSON.stringify(baseline);
}
