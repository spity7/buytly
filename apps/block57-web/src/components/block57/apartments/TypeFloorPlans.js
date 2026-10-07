"use client";

import { useMemo } from "react";
import Container from "@/components/block57/ui/Container";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { ButtonLink } from "@/components/block57/ui/Button";
import { ArrowIcon } from "@/components/block57/ui/icons";
import { getUnitFloorPlans } from "@/lib/block57/units";
import {
  getUnitType,
  getUnitTypeInquireHref,
} from "@/content/block57/unitTypes";
import { TYPE_PAGE_SECTIONS } from "@/content/block57/apartments";
import { mediaKey } from "./format";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import styles from "./TypeFloorPlans.module.scss";

const COPY = TYPE_PAGE_SECTIONS.floorPlans;

function residencesLabel(titles) {
  if (!titles.length) return null;
  return titles.length === 1
    ? `Residence ${titles[0]}`
    : `Residences ${titles.join(", ")}`;
}

/**
 * Floor plans for one residence type: static plans from unitTypes.js first,
 * then the units' plans from the API (signed URLs), de-duplicated by file so a
 * plan shared by several residences appears once with all their titles.
 * Each plan opens full size in a new tab.
 */
export default function TypeFloorPlans({ typeSlug }) {
  const type = getUnitType(typeSlug);
  const { units, isLoading } = useTypeUnits(typeSlug);

  const plans = useMemo(() => {
    const list = (type?.floorPlans || [])
      .filter((plan) => plan?.src)
      .map((plan, index) => ({
        key: `static-${plan.src}-${index}`,
        src: plan.src,
        title: plan.title || "Floor plan",
        alt: plan.alt,
        residences: [],
      }));
    const byKey = new Map();
    for (const unit of units) {
      for (const plan of getUnitFloorPlans(unit)) {
        const key = mediaKey(plan);
        const existing = byKey.get(key);
        if (existing) {
          if (!existing.residences.includes(unit.title)) {
            existing.residences.push(unit.title);
          }
          continue;
        }
        const entry = {
          key: plan._id || key,
          src: plan.url,
          title: String(plan.title || "").trim() || "Floor plan",
          residences: unit.title ? [unit.title] : [],
        };
        byKey.set(key, entry);
        list.push(entry);
      }
    }
    return list;
  }, [type, units]);

  if (!type) return null;

  const showSkeleton = !plans.length && isLoading;
  const showEmpty = !plans.length && !isLoading;

  return (
    <Section aria-labelledby="type-plans-title">
      <Container>
        <SectionHeading
          eyebrow={COPY.eyebrow}
          title={COPY.title}
          id="type-plans-title"
        />

        {showSkeleton ? (
          <VisuallyHidden as="p" role="status">
            Loading floor plans
          </VisuallyHidden>
        ) : null}
        {showSkeleton ? (
          <ul className={styles.grid} aria-hidden="true">
            {[0, 1].map((index) => (
              <li key={index} className={styles.card}>
                <div className={styles.sheet}>
                  <MediaFrame ratio="4/3" tone="sand" alt="" />
                </div>
                <div className={styles.body}>
                  <span className={styles.skeletonLine} />
                  <span
                    className={[styles.skeletonLine, styles.short].join(" ")}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {plans.length ? (
          <ul className={styles.grid}>
            {plans.map((plan) => {
              const residences = residencesLabel(plan.residences);
              const description = [plan.title, residences]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={plan.key} className={styles.card}>
                  <div className={styles.sheet}>
                    <MediaFrame
                      src={plan.src}
                      alt={plan.alt || `Floor plan: ${description}`}
                      ratio="4/3"
                      tone="paper"
                      fit="contain"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>{plan.title}</h3>
                    {residences ? (
                      <p className={styles.residences}>{residences}</p>
                    ) : null}
                    <a
                      href={plan.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.open}
                    >
                      <span>{COPY.open}</span>
                      <ArrowIcon size={14} className={styles.openIcon} />
                      <VisuallyHidden>
                        {`: ${description} (opens in a new tab)`}
                      </VisuallyHidden>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {showEmpty ? (
          <div className={styles.empty}>
            <p>{COPY.empty}</p>
            <ButtonLink
              href={getUnitTypeInquireHref(type.slug)}
              variant="text"
              size="sm"
            >
              Inquire
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
