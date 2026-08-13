"use client";

import React, { useMemo, useState } from "react";
import ListingSidebar from "../../sidebar";
import TopFilterBar from "./TopFilterBar";
import FeaturedListings from "./FeatuerdListings";
import ApiPagination from "@/components/property/ApiPagination";
import { useProperties } from "@/hooks/useProperties";

const PAGE_SIZE = 8;

const sortOptions = {
  Newest: { sortBy: "createdAt", sortOrder: "desc" },
  "Price Low": { sortBy: "price", sortOrder: "asc" },
  "Price High": { sortBy: "price", sortOrder: "desc" },
};

export default function PropertyFiltering() {
  const [pageNumber, setPageNumber] = useState(1);
  const [colstyle, setColstyle] = useState(false);
  const [currentSortingOption, setCurrentSortingOption] = useState("Newest");

  const [listingStatus, setListingStatus] = useState("All");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathroms, setBathroms] = useState(0);
  const [location, setLocation] = useState("All Cities");
  const [squirefeet, setSquirefeet] = useState([]);
  const [yearBuild, setyearBuild] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(() => {
    const sort = sortOptions[currentSortingOption] || sortOptions.Newest;
    const params = {
      page: pageNumber,
      limit: PAGE_SIZE,
      status: "active",
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    };

    if (listingStatus === "Buy") params.listingType = "sale";
    if (listingStatus === "Rent") params.listingType = "rent";
    if (propertyTypes.length === 1) params.type = propertyTypes[0];
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 1000000) params.maxPrice = priceRange[1];
    if (bedrooms > 0) params.bedrooms = bedrooms;
    if (location && location !== "All Cities") params.city = location;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    return params;
  }, [
    pageNumber,
    currentSortingOption,
    listingStatus,
    propertyTypes,
    priceRange,
    bedrooms,
    location,
    searchQuery,
  ]);

  const { data, isLoading, isError } = useProperties(queryParams);
  const cards = data?.cards || [];
  const pagination = data?.pagination;

  const resetFilter = () => {
    setListingStatus("All");
    setPropertyTypes([]);
    setPriceRange([0, 1000000]);
    setBedrooms(0);
    setBathroms(0);
    setLocation("All Cities");
    setSquirefeet([]);
    setyearBuild([0, 2050]);
    setCategories([]);
    setCurrentSortingOption("Newest");
    setSearchQuery("");
    setPageNumber(1);
    document.querySelectorAll(".filterInput").forEach(function (element) {
      element.value = null;
    });
  };

  const handlelistingStatus = (elm) => {
    setPageNumber(1);
    setListingStatus((pre) => (pre == elm ? "All" : elm));
  };

  const handlepropertyTypes = (elm) => {
    setPageNumber(1);
    if (elm == "All") {
      setPropertyTypes([]);
    } else {
      setPropertyTypes((pre) =>
        pre.includes(elm) ? [...pre.filter((el) => el != elm)] : [...pre, elm],
      );
    }
  };

  const handlepriceRange = (elm) => {
    setPageNumber(1);
    setPriceRange(elm);
  };

  const handlebedrooms = (elm) => {
    setPageNumber(1);
    setBedrooms(elm);
  };

  const handlebathroms = (elm) => {
    setPageNumber(1);
    setBathroms(elm);
  };

  const handlelocation = (elm) => {
    setPageNumber(1);
    setLocation(elm);
  };

  const handlesquirefeet = (elm) => {
    setPageNumber(1);
    setSquirefeet(elm);
  };

  const handleyearBuild = (elm) => {
    setPageNumber(1);
    setyearBuild(elm);
  };

  const handlecategories = (elm) => {
    setPageNumber(1);
    if (elm == "All") {
      setCategories([]);
    } else {
      setCategories((pre) =>
        pre.includes(elm) ? [...pre.filter((el) => el != elm)] : [...pre, elm],
      );
    }
  };

  const filterFunctions = {
    handlelistingStatus,
    handlepropertyTypes,
    handlepriceRange,
    handlebedrooms,
    handlebathroms,
    handlelocation,
    handlesquirefeet,
    handleyearBuild,
    handlecategories,
    priceRange,
    listingStatus,
    propertyTypes,
    resetFilter,
    bedrooms,
    bathroms,
    location,
    squirefeet,
    yearBuild,
    categories,
    setPropertyTypes,
    setSearchQuery: (value) => {
      setPageNumber(1);
      setSearchQuery(value);
    },
  };

  const pageContentTrac = [
    pagination?.total ? (pageNumber - 1) * PAGE_SIZE + 1 : 0,
    pagination?.total ? Math.min(pageNumber * PAGE_SIZE, pagination.total) : 0,
    pagination?.total || 0,
  ];

  return (
    <section className="pt0 pb90 bgc-f7">
      <div className="container">
        <div className="row gx-xl-5">
          <div className="col-lg-4 d-none d-lg-block">
            <ListingSidebar filterFunctions={filterFunctions} />
          </div>

          <div
            className="offcanvas offcanvas-start p-0"
            tabIndex="-1"
            id="listingSidebarFilter"
            aria-labelledby="listingSidebarFilterLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="listingSidebarFilterLabel">
                Listing Filter
              </h5>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body p-0">
              <ListingSidebar filterFunctions={filterFunctions} />
            </div>
          </div>

          <div className="col-lg-8">
            <div className="row align-items-center mb20">
              <TopFilterBar
                pageContentTrac={pageContentTrac}
                colstyle={colstyle}
                setColstyle={setColstyle}
                setCurrentSortingOption={(option) => {
                  setPageNumber(1);
                  setCurrentSortingOption(option);
                }}
              />
            </div>

            {isError && (
              <div className="alert alert-danger mb20">
                Failed to load properties. Please try again.
              </div>
            )}

            <div className="row mt15">
              <FeaturedListings
                colstyle={colstyle}
                data={cards}
                isLoading={isLoading}
              />
            </div>

            <div className="row">
              <ApiPagination
                page={pageNumber}
                totalPages={pagination?.totalPages || 1}
                total={pagination?.total || 0}
                limit={PAGE_SIZE}
                onPageChange={setPageNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
