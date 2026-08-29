"use client";

import React, { useLayoutEffect, useRef } from "react";

export function DashboardFilterBar({ children, className = "" }) {
  return (
    <div
      className={`dashboard-table-filters d-flex flex-wrap gap-3 align-items-center ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function FilterSearch({
  value,
  onChange,
  placeholder = "Search",
  disabled = false,
  id = "dashboard-filter-search",
}) {
  const inputRef = useRef(null);
  const shouldRestoreFocusRef = useRef(false);

  useLayoutEffect(() => {
    if (
      shouldRestoreFocusRef.current &&
      inputRef.current &&
      document.activeElement !== inputRef.current
    ) {
      const input = inputRef.current;
      input.focus();
      const end = input.value.length;
      input.setSelectionRange(end, end);
    }
  });

  return (
    <div className="dashboard-table-filters__search">
      <div className="search_area">
        <input
          ref={inputRef}
          id={id}
          type="search"
          className="form-control bdrs12"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onFocus={() => {
            shouldRestoreFocusRef.current = true;
          }}
          onBlur={() => {
            shouldRestoreFocusRef.current = false;
          }}
          onChange={(event) => onChange(event.target.value)}
        />
        <label htmlFor={id}>
          <span className="flaticon-search" />
        </label>
      </div>
    </div>
  );
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  hideLabel = false,
}) {
  return (
    <div className="dashboard-table-filters__select">
      {!hideLabel && label ? (
        <label className="heading-color ff-heading fw600 mb0 me-2" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className="form-control form-select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterSortSelect({
  id = "dashboard-filter-sort",
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <div className="page_control_shorting bdr1 bdrs12 py-2 ps-3 pe-2 bgc-white dashboard-table-filters__sort">
      <div className="pcs_dropdown d-flex align-items-center">
        <span style={{ minWidth: "50px" }} className="title-color">
          Sort:
        </span>
        <select
          id={id}
          className="form-select show-tick border-0 shadow-none"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
