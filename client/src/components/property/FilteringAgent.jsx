"use client";

import { useMemo, useState } from "react";
import TopFilter from "./TopFilter";
import AllAgents from "./agents/AllAgents";
import ApiPagination from "./ApiPagination";
import { useAgents } from "@/hooks/useAgents";
import { mapAgentToCard } from "@/lib/agents/mapAgent";

const PAGE_SIZE = 15;

export default function FilteringAgent() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [location, setLocation] = useState("All Cities");

  const specialty = propertyTypes.length === 1 ? propertyTypes[0] : undefined;
  const city = location !== "All Cities" ? location : undefined;

  const { data, isLoading, isError } = useAgents({
    page,
    limit: PAGE_SIZE,
    city,
    specialty,
  });

  const agents = useMemo(() => {
    const cards = (data?.agents || []).map(mapAgentToCard);
    if (!searchQuery.trim()) return cards;

    const query = searchQuery.trim().toLowerCase();
    return cards.filter((agent) => agent.name.toLowerCase().includes(query));
  }, [data?.agents, searchQuery]);

  const resetFilter = () => {
    setPropertyTypes([]);
    setLocation("All Cities");
    setSearchQuery("");
    setPage(1);
  };

  const filterFunctions = {
    handlepropertyTypes: (value) => {
      setPage(1);
      if (value === "All") {
        setPropertyTypes([]);
        return;
      }
      setPropertyTypes((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [value],
      );
    },
    handlelocation: (value) => {
      setPage(1);
      setLocation(value);
    },
    setSearchQuery: (value) => {
      setPage(1);
      setSearchQuery(value);
    },
    propertyTypes,
    resetFilter,
    location,
    setPropertyTypes,
  };

  return (
    <section className="our-agents pt-0">
      <div className="container">
        <div className="row align-items-center mb20">
          <TopFilter filterFunctions={filterFunctions} />
        </div>

        {isError && (
          <div className="alert alert-danger mb20">
            Failed to load agents. Please try again.
          </div>
        )}

        {isLoading ? (
          <p className="text mb30">Loading agents...</p>
        ) : agents.length ? (
          <div
            className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <AllAgents data={agents} />
          </div>
        ) : (
          <p className="text mb30">No agents match your filters.</p>
        )}

        <div className="row">
          <ApiPagination
            page={page}
            totalPages={data?.pagination?.totalPages || 1}
            total={data?.pagination?.total || 0}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
