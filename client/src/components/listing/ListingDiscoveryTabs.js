"use client";

import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { useProjects } from "@/hooks/useProjects";
import Link from "next/link";

export default function ListingDiscoveryTabs({ limit = 6 }) {
  const [mode, setMode] = useState("units");
  const { data: unitsData, isLoading: unitsLoading } = useProperties(
    { page: 1, limit, status: "active" },
    { enabled: mode === "units" },
  );
  const { data: projectsData, isLoading: projectsLoading } = useProjects(
    { page: 1, limit, status: "active" },
    { enabled: mode === "projects" },
  );

  const cards =
    mode === "units" ? unitsData?.cards || [] : projectsData?.cards || [];
  const loading = mode === "units" ? unitsLoading : projectsLoading;

  return (
    <div>
      <div className="d-flex gap-2 mb30">
        <button
          type="button"
          className={`ud-btn btn-sm ${mode === "units" ? "btn-thm" : "btn-white2"}`}
          onClick={() => setMode("units")}
        >
          Units
        </button>
        <button
          type="button"
          className={`ud-btn btn-sm ${mode === "projects" ? "btn-thm" : "btn-white2"}`}
          onClick={() => setMode("projects")}
        >
          Projects
        </button>
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="row">
          {cards.map((item) => (
            <div className="col-sm-6 col-lg-4" key={item.id}>
              <div className="listing-style1 bdr1 bdrs12 mb30">
                <div className="list-thumb">
                  <img
                    className="w-100"
                    src={item.image}
                    alt={item.title}
                    style={{ height: 220, objectFit: "cover" }}
                  />
                </div>
                <div className="list-content p20">
                  <h6 className="list-title">
                    <Link
                      href={
                        item.itemType === "project"
                          ? `/project/${item.slug}`
                          : `/single-v1/${item.id}`
                      }
                    >
                      {item.title}
                    </Link>
                  </h6>
                  <p className="list-text mb-0">{item.location}</p>
                  <div className="list-price mt10">{item.price}</div>
                  {item.itemType === "project" ? (
                    <div className="fz14 text-muted">
                      {item.unitCount} unit{item.unitCount === 1 ? "" : "s"}
                    </div>
                  ) : item.projectTitle ? (
                    <div className="fz14 text-muted">{item.projectTitle}</div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
