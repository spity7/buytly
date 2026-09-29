"use client";
import React, { useState } from "react";
import Slider from "rc-slider";
import { LISTING_MAX_PRICE } from "@/lib/listings/listingFilters";

const PriceRange = ({ filterFunctions }) => {
  const [price, setPrice] = useState([
    filterFunctions?.priceRange?.[0] ?? 0,
    filterFunctions?.priceRange?.[1] ?? LISTING_MAX_PRICE,
  ]);

  const handleOnChange = (value) => {
    setPrice(value);
    filterFunctions?.handlepriceRange([value[0] || 0, value[1]]);
  };

  return (
    <>
      <div className="range-wrapper">
        <Slider
          range
          formatLabel={() => ``}
          max={LISTING_MAX_PRICE}
          min={0}
          value={price}
          onChange={(value) => handleOnChange(value)}
          id="slider"
        />
        <div className="d-flex align-items-center">
          <span id="slider-range-value1">${price[0]}</span>
          <i className="fa-sharp fa-solid fa-minus mx-2 dark-color icon" />
          <span id="slider-range-value2">${price[1]}</span>
        </div>
      </div>
    </>
  );
};

export default PriceRange;
