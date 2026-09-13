"use client";

import Select from "@/components/common/AppSelect";
import { useId } from "react";

/**
 * react-select uses a module-level id counter that diverges between SSR and
 * client when the number/order of mounts differs. Stable instanceId fixes hydration.
 */
export default function AppSelect(props) {
  const reactId = useId();
  const instanceId =
    props.instanceId ?? `buytly-select-${reactId.replace(/:/g, "")}`;

  return <Select {...props} instanceId={instanceId} />;
}
