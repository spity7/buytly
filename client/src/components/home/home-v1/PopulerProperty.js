"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import PopularListings from "./PopularListings";
import { useProperties } from "@/hooks/useProperties";

export default function PopulerProperty() {
  const params = useMemo(
    () => ({
      limit: 8,
      status: "active",
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [],
  );

  const { data, isLoading } = useProperties(params);
  const cards = data?.cards || [];

  return (
    <section className="bgc-dark">
      <div className="container">
        <div className="row " data-aos="fade-up">
          <div className="col-lg-12">
            <div className="main-title2">
              <h2 className="title text-white">Discover Popular Properties</h2>
              <p className="paragraph text-white">
                Browse the latest homes for sale
              </p>
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
