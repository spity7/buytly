"use client";

import React, { useMemo, useState } from "react";
import ListingItems from "../ListingItems";
import Link from "next/link";
import { useAgentProperties } from "@/hooks/useAgentProperties";

export default function ListingItemsContainer({ agentId }) {
  const [currentCategory, setCurrentCategory] = useState("All");

  const params = useMemo(() => {
    const base = { limit: 8 };
    if (currentCategory === "rent") return { ...base, listingType: "rent" };
    if (currentCategory === "sale") return { ...base, listingType: "sale" };
    return base;
  }, [currentCategory]);

  const { data, isLoading } = useAgentProperties(agentId, params);
  const cards = data?.cards || [];
  const total = data?.pagination?.total || cards.length;

  const filteredCards = useMemo(() => {
    if (currentCategory === "rent") {
      return cards.filter((item) => item.forRent);
    }
    if (currentCategory === "sale") {
      return cards.filter((item) => !item.forRent);
    }
    return cards;
  }, [cards, currentCategory]);

  return (
    <div className="row align-items-center mt20">
      <div className="col-sm-4">
        <h6 className="fz17">Listing {total}</h6>
      </div>

      <div className="col-sm-8">
        <div className="dark-light-navtab style4 mt-0 mt-lg-4 mb30">
          <ul
            className="nav nav-pills justify-content-start justify-content-sm-end"
            id="pills-tab"
            role="tablist"
          >
            {["All", "rent", "sale"].map((category) => (
              <li className="nav-item" role="presentation" key={category}>
                <button
                  className={
                    currentCategory === category
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={() => setCurrentCategory(category)}
                >
                  {category === "All"
                    ? "All"
                    : category === "rent"
                      ? "For Rent"
                      : "For Sale"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-lg-12">
        <div className="tab-content" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            {isLoading ? (
              <p>Loading agent listings...</p>
            ) : filteredCards.length ? (
              <div className="row">
                <ListingItems data={filteredCards.slice(0, 4)} />
              </div>
            ) : (
              <p>No listings for this agent yet.</p>
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="d-grid pb30 bdrb1">
            <Link href="/listings" className="ud-btn btn-white2">
              Show all {total} properties
              <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
