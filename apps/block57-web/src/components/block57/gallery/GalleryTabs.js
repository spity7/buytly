"use client";

import { useId, useRef, useState } from "react";
import styles from "./GalleryTabs.module.scss";

/**
 * Gallery tabs (live Elementor nested tabs): centred text tabs, active green,
 * inactive #E3DCD9 (#ADA4A1 on hover), instant panel swap. WAI-ARIA tabs with
 * automatic activation: Left/Right arrows (wrapping), Home and End move focus
 * and select. Without JavaScript every panel stays visible.
 *
 * @param {{ label: string,
 *   tabs: { slug: string, label: string, content: React.ReactNode }[] }} props
 */
export default function GalleryTabs({ label, tabs }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const baseId = useId();

  function select(index) {
    setActive(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event) {
    const last = tabs.length - 1;
    const next = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  }

  return (
    <div className={styles.tabs}>
      <div
        role="tablist"
        aria-label={label}
        className={styles.tablist}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.slug}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.slug}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${tab.slug}`}
            tabIndex={index === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.slug}
          role="tabpanel"
          id={`${baseId}-panel-${tab.slug}`}
          aria-labelledby={`${baseId}-tab-${tab.slug}`}
          className={styles.panel}
          data-active={index === active ? "true" : "false"}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
