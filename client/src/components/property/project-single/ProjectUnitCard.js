"use client";

import Image from "next/image";
import Link from "next/link";
import { remoteImageProps } from "@/lib/images/remoteImage";
import { mapPropertyToCard } from "@/lib/properties/mapProperty";

const PROPERTY_TYPE_LABELS = {
  apartment: "Apartment",
  villa: "Villa",
  duplex: "Duplex",
  penthouse: "Penthouse",
  townhouse: "Townhouse",
  office: "Office",
  shop: "Shop",
  building: "Building",
  land: "Land",
  chalet: "Chalet",
};

function unitTypeLabel(type) {
  if (!type) return null;
  return PROPERTY_TYPE_LABELS[type] || type;
}

function unitGridColumnClass(totalCount, sold = false) {
  if (sold) return "col-12 col-md-6 col-lg-4";
  if (totalCount <= 1) return "col-12 col-md-8 col-lg-6";
  if (totalCount === 2) return "col-12 col-md-6";
  return "col-12 col-md-6 col-lg-4";
}

export default function ProjectUnitCard({ unit, sold = false, gridSize = 1 }) {
  const card = mapPropertyToCard(unit);
  if (!card) return null;

  const href = `/single-v1/${card.id}`;
  const typeLabel = unitTypeLabel(unit.type);
  const areaUnit = unit.areaUnit || "sqm";
  const columnClass = unitGridColumnClass(gridSize, sold);

  return (
    <div className={columnClass}>
      <div
        className={`listing-style1 project-unit-card h-100 bdr1 bdrs12 overflow-hidden bg-white ${sold ? "project-unit-card--sold" : ""}`}
      >
        <div className="list-thumb project-unit-card__thumb">
          <Link href={href} tabIndex={sold ? -1 : undefined}>
            <Image
              width={382}
              height={248}
              className="w-100 cover"
              src={card.image}
              alt={card.title}
              style={{ height: "200px" }}
              {...remoteImageProps(card.image)}
            />
          </Link>
          {!sold ? (
            <div className="list-price project-unit-card__price">
              {card.price}
            </div>
          ) : (
            <span className="project-unit-card__sold-badge badge bg-secondary">
              Sold
            </span>
          )}
        </div>

        <div className="list-content project-unit-card__body">
          {typeLabel ? (
            <p className="project-unit-card__type fz12 text-uppercase ff-heading mb5">
              {typeLabel}
            </p>
          ) : null}

          <h6 className="list-title mb10">
            <Link href={href}>{card.title}</Link>
          </h6>

          {sold ? (
            <p className="fz14 text-muted mb0">
              Sold — shown for reference only.
            </p>
          ) : (
            <>
              <div className="list-meta d-flex align-items-center flex-wrap gap-2 mb15">
                <span className="fz14">
                  <span className="flaticon-bed pe-1" aria-hidden="true" />
                  {card.bed} bed
                </span>
                <span className="fz14">
                  <span className="flaticon-shower pe-1" aria-hidden="true" />
                  {card.bath} bath
                </span>
                <span className="fz14">
                  <span className="flaticon-expand pe-1" aria-hidden="true" />
                  {card.sqft} {areaUnit}
                </span>
              </div>

              <Link href={href} className="ud-btn btn-thm btn-sm w-100">
                View listing
                <i
                  className="fal fa-arrow-right-long ms-2"
                  aria-hidden="true"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
