"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import PopularListings from "./PopularListings";
import { useProperties } from "@/hooks/useProperties";

export default function PopulerProperty() {
  const [currentType, setCurrentType] = useState("rent");

  const params = useMemo(
    () => ({
      limit: 8,
      listingType: currentType === "rent" ? "rent" : "sale",
      status: "active",
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [currentType],
  );

  const { data, isLoading } = useProperties(params);
  const cards = data?.cards || [];

  return (
    <section className="bgc-dark">
      <div className="container">
        <div className="row " data-aos="fade-up">
          <div className="col-lg-9">
            <div className="main-title2">
              <h2 className="title text-white">Discover Popular Properties</h2>
              <p className="paragraph text-white">
                Browse the latest listings for rent and sale
              </p>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="dark-light-navtab text-start text-lg-end mt-0 mt-lg-4 mb-4">
              <ul className="nav nav-pills justify-content-start justify-content-lg-end">
                <li className="nav-item" onClick={() => setCurrentType("rent")}>
                  <button
                    className={`nav-link ${currentType == "rent" ? "active" : ""} `}
                  >
                    For Rent
                  </button>
                </li>
                <li className="nav-item" onClick={() => setCurrentType("sale")}>
                  <button
                    className={`nav-link me-0 ${currentType == "sale" ? "active" : ""} `}
                  >
                    For Sale
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row" data-aos="fade-up" data-aos-delay="300">
          <div className="col-lg-12">
            {isLoading ? (
              <p className="text-white text-center py-4">
                Loading properties...
              </p>
            ) : (
              <PopularListings data={cards} />
            )}
            <div className="d-grid d-md-block text-center mt30 mt0-md">
              <Link href="/listings" className="ud-btn btn-thm">
                See All Properties
                <i className="fal fa-arrow-right-long"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
