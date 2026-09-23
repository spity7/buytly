"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import { buytlyApi } from "@/api/generated";
import {
  formatPropertyLocationLabel,
  partitionProjectUnits,
} from "@/lib/properties/mapProperty";
import { formatPrice } from "@/lib/properties/formatPrice";
import Link from "next/link";
import { useEffect, useState } from "react";

function UnitCard({ unit, sold = false }) {
  const id = unit._id || unit.id;
  return (
    <div className="col-md-6 col-lg-4 mb20">
      <div className="bdr1 bdrs12 p20 h-100 bg-white">
        <div className="d-flex justify-content-between align-items-start gap-2 mb10">
          <h5 className="mb0">{unit.title}</h5>
          {sold ? <span className="badge bg-secondary">Sold</span> : null}
        </div>
        <p className="mb10">
          {formatPrice(unit.price, unit.currency || "USD")}
        </p>
        <p className="fz14 text-muted mb15">
          {[
            unit.bedrooms != null && `${unit.bedrooms} bed`,
            unit.bathrooms != null && `${unit.bathrooms} bath`,
            unit.area != null && `${unit.area} sqm`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {sold ? (
          <span className="fz14 text-muted">No longer available</span>
        ) : (
          <Link href={`/single-v1/${id}`} className="ud-btn btn-thm btn-sm">
            View unit
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailClient({ slug }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await buytlyApi.getProjectBySlug(slug);
        if (!cancelled) setProject(response.data);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <>
        <DefaultHeader />
        <MobileMenu />
        <div className="container pt100 pb100">Project not found.</div>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <DefaultHeader />
        <MobileMenu />
        <div className="container pt100 pb100">Loading...</div>
        <Footer />
      </>
    );
  }

  const { available, sold } = partitionProjectUnits(project.units || []);
  const images = (project.media || [])
    .filter((m) => m.type === "image")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const hero = images[0]?.url || "/images/listings/list-1.jpg";
  const priceRange =
    project.priceMin != null
      ? project.priceMax != null && project.priceMax !== project.priceMin
        ? `${formatPrice(project.priceMin, "USD")} – ${formatPrice(project.priceMax, "USD")}`
        : `From ${formatPrice(project.priceMin, "USD")}`
      : "Price on request";
  const projectSold = project.status === "sold";
  const availabilityLabel = projectSold
    ? "Fully sold"
    : available.length
      ? `${available.length} available${sold.length ? ` · ${sold.length} sold` : ""}`
      : sold.length
        ? `${sold.length} sold`
        : "No units listed";

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="pt80 pb90 bgc-f7">
        <div className="container">
          <nav className="breadcumb-style1 mb20">
            <div className="breadcumb-list">
              <Link href="/">Home</Link>
              <Link href="/listings?view=projects">Projects</Link>
              <span>{project.title}</span>
            </div>
          </nav>

          <div className="row mb40">
            <div className="col-lg-7">
              <h1 className="mb10">{project.title}</h1>
              <p className="text mb15">
                {formatPropertyLocationLabel(project.location)} ·{" "}
                <span className="text-capitalize">{project.kind}</span>
                {projectSold ? " · Sold out" : " · For sale"}
              </p>
              <p className="fz14 text-muted mb10">
                {availabilityLabel}
                {" · "}
                <i
                  className="flaticon-fullscreen pe-1 align-text-top"
                  aria-hidden="true"
                />
                {(project.viewCount ?? 0).toLocaleString()} view
                {(project.viewCount ?? 0) === 1 ? "" : "s"}
              </p>
              <p className="h4 text-thm mb20">{priceRange}</p>
              <p>{project.description}</p>
              {project.amenities?.length ? (
                <div className="mt20">
                  <h5 className="mb10">Shared amenities</h5>
                  <ul className="list-unstyled d-flex flex-wrap gap-2">
                    {project.amenities.map((item) => (
                      <li key={item} className="badge bg-white text-dark bdr1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.virtualTourUrl ? (
                <p className="mt20 mb0">
                  <a
                    href={project.virtualTourUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-thm"
                  >
                    Open virtual tour
                  </a>
                </p>
              ) : null}
            </div>
            <div className="col-lg-5">
              <img
                src={hero}
                alt=""
                className="w-100 bdrs12 mb-3"
                style={{ maxHeight: 320, objectFit: "cover" }}
              />
              {images.length > 1 ? (
                <div className="row g-2">
                  {images.slice(1, 4).map((img) => (
                    <div className="col-4" key={img._id}>
                      <img
                        src={img.url}
                        alt=""
                        className="w-100 bdrs8"
                        style={{ height: 80, objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {available.length > 0 ? (
            <>
              <h3 className="mb20">Units for sale ({available.length})</h3>
              <div className="row">
                {available.map((unit) => (
                  <UnitCard key={unit._id || unit.id} unit={unit} />
                ))}
              </div>
            </>
          ) : (
            <h3 className="mb20">Units for sale</h3>
          )}
          {available.length === 0 && !sold.length ? (
            <p className="bdr1 bdrs12 p20 bg-white">No units available yet.</p>
          ) : null}

          {sold.length > 0 ? (
            <div className="mt30">
              <h3 className="mb20">Sold units ({sold.length})</h3>
              <div className="row">
                {sold.map((unit) => (
                  <UnitCard key={unit._id || unit.id} unit={unit} sold />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </>
  );
}
