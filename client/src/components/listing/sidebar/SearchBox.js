"use client";

import React from "react";

const SearchBox = ({ filterFunctions }) => {
  return (
    <div className="search_area">
      <input
        type="text"
        className="form-control"
        placeholder="What are you looking for?"
        value={filterFunctions?.searchInput ?? ""}
        onChange={(event) =>
          filterFunctions?.setSearchQuery?.(event.target.value)
        }
      />
      <label>
        <span className="flaticon-search" />
      </label>
    </div>
  );
};

export default SearchBox;
