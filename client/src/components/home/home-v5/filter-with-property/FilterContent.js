"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "rc-slider";
import Select from "react-select";

import {
  HERO_PROPERTY_TYPE_MAP,
  buildListingsHref,
} from "@/lib/listings/listingSearchParams";
import { LISTING_MAX_PRICE } from "@/lib/listings/listingFilters";
import { LISTING_CITY_OPTIONS } from "@/lib/listings/listingCities";

const LOCATION_OPTIONS = LISTING_CITY_OPTIONS;

const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Any type" },
  { value: "Apartments", label: "Apartments" },
  { value: "Bungalow", label: "Bungalow" },
  { value: "Houses", label: "Houses" },
  { value: "Office", label: "Office" },
  { value: "TownHome", label: "TownHome" },
  { value: "Villa", label: "Villa" },
];

const selectStyles = {
  control: (provided) => ({
    ...provided,
    background: "none",
  }),
  option: (styles, { isFocused, isSelected, isHovered }) => ({
    ...styles,
    backgroundColor: isSelected
      ? "#eb6753"
      : isHovered
        ? "#eb675312"
        : isFocused
          ? "#eb675312"
          : undefined,
  }),
};

const FilterContent = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buy");
  const [search, setSearch] = useState("");
  const [propertyTypeLabel, setPropertyTypeLabel] = useState("");
  const [location, setLocation] = useState("All Cities");
  const [price, setPrice] = useState([0, LISTING_MAX_PRICE]);

  const tabs = [
    { id: "buy", label: "Buy" },
    { id: "rent", label: "Rent" },
    { id: "sold", label: "Sold" },
  ];

  const handleSearch = () => {
    const listingStatus =
      activeTab === "buy" ? "Buy" : activeTab === "rent" ? "Rent" : "Sold";
    const mappedType = propertyTypeLabel
      ? HERO_PROPERTY_TYPE_MAP[propertyTypeLabel]
      : undefined;

    router.push(
      buildListingsHref({
        listingStatus,
        searchQuery: search,
        location,
        priceRange: price,
        propertyTypes: mappedType ? [mappedType] : [],
      }),
    );
  };

  return (
    <div className="advance-style4 at-home5 mt-120 mt60-lg mb10 mx-auto animate-up-2">
      <ul className="nav nav-tabs p-0 m-0">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content text-start">
        {tabs.map((tab) => (
          <div
            className={`${activeTab === tab.id ? "active" : ""} tab-pane`}
            key={tab.id}
          >
            <div className="advance-content-style3 at-home5">
              <div className="row align-items-center">
                <div className="col-md-4 col-xl-3 bdrr1 bdrrn-sm">
                  <label>Search</label>
                  <div className="advance-search-field position-relative">
                    <form
                      className="form-search position-relative"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSearch();
                      }}
                    >
                      <div className="box-search">
                        <input
                          className="form-control bgc-f7 bdrs12 ps-0"
                          type="text"
                          name="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder={`Enter keyword for ${tab.label}`}
                        />
                      </div>
                    </form>
                  </div>
                </div>

                <div className="col-md-4 col-xl-2 bdrr1 bdrrn-sm px20 pl15-sm">
                  <div className="mt-3 mt-md-0 px-0">
                    <div className="bootselect-multiselect">
                      <label className="fz14">Looking For</label>
                      <Select
                        options={PROPERTY_TYPE_OPTIONS}
                        styles={selectStyles}
                        className="text-start select-borderless"
                        classNamePrefix="select"
                        value={
                          PROPERTY_TYPE_OPTIONS.find(
                            (option) => option.value === propertyTypeLabel,
                          ) || PROPERTY_TYPE_OPTIONS[0]
                        }
                        onChange={(option) =>
                          setPropertyTypeLabel(option?.value || "")
                        }
                        isClearable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-xl-2 bdrr1 bdrrn-sm px20 pl15-sm">
                  <div className="mt-3 mt-md-0">
                    <div className="bootselect-multiselect">
                      <label className="fz14">Location</label>
                      <Select
                        options={LOCATION_OPTIONS}
                        styles={selectStyles}
                        className="text-start select-borderless"
                        classNamePrefix="select"
                        value={
                          LOCATION_OPTIONS.find(
                            (option) => option.value === location,
                          ) || LOCATION_OPTIONS[0]
                        }
                        onChange={(option) =>
                          setLocation(option?.value || "All Cities")
                        }
                        isClearable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-xl-2 bdrr1 bdrrn-sm px20 pl15-sm">
                  <div className="mt-3 mt-md-0">
                    <div className="dropdown-lists">
                      <label className="fz14 mb-1">Price</label>
                      <div
                        className="btn open-btn text-start dropdown-toggle"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        style={{ fontSize: "13px" }}
                      >
                        ${price[0].toLocaleString()} - $
                        {price[1].toLocaleString()}{" "}
                        <i className="fas fa-caret-down" />
                      </div>
                      <div className="dropdown-menu">
                        <div className="widget-wrapper pb20 mb0 pl20 pr20">
                          <div className="range-wrapper at-home10">
                            <Slider
                              range
                              max={LISTING_MAX_PRICE}
                              min={0}
                              value={price}
                              onChange={setPrice}
                              id="slider"
                            />
                            <div className="d-flex align-items-center">
                              <span id="slider-range-value1">
                                ${price[0].toLocaleString()}
                              </span>
                              <i className="fa-sharp fa-solid fa-minus mx-2 dark-color icon" />
                              <span id="slider-range-value2">
                                ${price[1].toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4 col-xl-3">
                  <div className="d-flex align-items-center justify-content-start justify-content-md-center mt-3 mt-md-0">
                    <button
                      className="advance-search-btn"
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#advanceSeachModal"
                    >
                      <span className="flaticon-settings" /> Advanced
                    </button>
                    <button
                      className="advance-search-icon ud-btn btn-thm ms-4"
                      type="button"
                      onClick={handleSearch}
                    >
                      <span className="flaticon-search" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterContent;
