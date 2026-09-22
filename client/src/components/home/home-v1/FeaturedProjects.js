"use client";

import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";

export default function FeaturedProjects() {
  const { data, isLoading } = useProjects({
    page: 1,
    limit: 6,
    status: "active",
    sortBy: "viewCount",
    sortOrder: "desc",
  });

  const cards = data?.cards || [];

  if (isLoading) {
    return (
      <p className="text-center py-4 text-white">Loading featured projects...</p>
    );
  }

  if (!cards.length) return null;

  return (
    <section className="pb90 pb30-md">
      <div className="container">
        <div className="row mb30">
          <div className="col-lg-8">
            <div className="main-title2">
              <h2 className="title">Featured Projects</h2>
              <p className="paragraph">
                Developments with multiple units or standalone homes for sale
              </p>
            </div>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link href="/listings?view=projects" className="ud-btn btn-thm">
              Browse projects
            </Link>
          </div>
        </div>
        <div className="row">
          {cards.map((item) => (
            <div className="col-sm-6 col-lg-4 mb30" key={item.id}>
              <div className="listing-style1 bdr1 bdrs12 h-100">
                <div className="list-thumb">
                  <img
                    src={item.image}
                    alt=""
                    className="w-100"
                    style={{ height: 220, objectFit: "cover" }}
                  />
                  <div className="list-price">{item.price}</div>
                </div>
                <div className="list-content p20">
                  <h6 className="list-title">
                    <Link href={`/project/${item.slug}`}>{item.title}</Link>
                  </h6>
                  <p className="list-text mb-0">{item.location}</p>
                  <p className="fz14 text-muted mb0">
                    {item.unitCount} unit{item.unitCount === 1 ? "" : "s"} · For
                    sale
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
