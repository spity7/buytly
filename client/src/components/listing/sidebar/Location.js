"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { LISTING_CITY_OPTIONS } from "@/lib/listings/listingCities";

const Location = ({ filterFunctions }) => {
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => {
    setShowSelect(true);
  }, []);
  const locationOptions = LISTING_CITY_OPTIONS;

  const customStyles = {
    option: (styles, { isFocused, isSelected, isHovered }) => {
      return {
        ...styles,
        backgroundColor: isSelected
          ? "#eb6753"
          : isHovered
          ? "#eb675312"
          : isFocused
          ? "#eb675312"
          : undefined,
      };
    },
  };

  return (
    <>
      {" "}
      {showSelect && (
        <Select
          defaultValue={[locationOptions[0]]}
          name="colors"
          styles={customStyles}
          options={locationOptions}
          value={{
            value: filterFunctions.location,
            label: filterFunctions.location,
          }}
          className="select-custom filterSelect"
          classNamePrefix="select"
          onChange={(e) => filterFunctions?.handlelocation(e.value)}
          required
        />
      )}{" "}
    </>
  );
};

export default Location;
