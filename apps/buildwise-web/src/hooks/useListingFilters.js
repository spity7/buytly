"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LISTING_MAX_PRICE,
  LISTING_PAGE_SIZE,
  buildListingQueryParams,
  getListingPageRange,
} from "@/lib/listings/listingFilters";
import {
  buildListingSearchParams,
  parseListingSearchParams,
} from "@/lib/listings/listingSearchParams";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useProperties } from "@/hooks/useProperties";
import { useProjects } from "@/hooks/useProjects";
import { buildProjectQueryParams } from "@/lib/listings/listingFilters";

function applyParsedFilters(parsed, setters) {
  setters.setPageNumber(parsed.pageNumber);
  setters.setCurrentSortingOption(parsed.currentSortingOption);
  setters.setListingStatus(parsed.listingStatus);
  setters.setPropertyTypes(parsed.propertyTypes);
  setters.setPriceRange(parsed.priceRange);
  setters.setBedrooms(parsed.bedrooms);
  setters.setLocation(parsed.location);
  setters.setSearchInput(parsed.searchQuery);
  setters.setDiscoveryMode(parsed.discoveryMode);
}

export function useListingFilters({
  pageSize = LISTING_PAGE_SIZE,
  basePath = "/listings",
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKey = searchParams.toString();
  const isApplyingUrl = useRef(false);

  const initial = useMemo(
    () => parseListingSearchParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [pageNumber, setPageNumber] = useState(initial.pageNumber);
  const [currentSortingOption, setCurrentSortingOption] = useState(
    initial.currentSortingOption,
  );
  const [listingStatus, setListingStatus] = useState(initial.listingStatus);
  const [discoveryMode, setDiscoveryMode] = useState(initial.discoveryMode);
  const [propertyTypes, setPropertyTypes] = useState(initial.propertyTypes);
  const [priceRange, setPriceRange] = useState(initial.priceRange);
  const [bedrooms, setBedrooms] = useState(initial.bedrooms);
  const [bathrooms, setBathrooms] = useState(0);
  const [location, setLocation] = useState(initial.location);
  const [squareFeet, setSquareFeet] = useState([]);
  const [yearBuild, setYearBuild] = useState([]);
  const [categories, setCategories] = useState([]);

  const resetPage = useCallback(() => setPageNumber(1), []);

  const [searchInput, setSearchInput, searchQuery] = useDebouncedSearch(
    initial.searchQuery,
    300,
    resetPage,
  );

  useEffect(() => {
    isApplyingUrl.current = true;
    const parsed = parseListingSearchParams(searchParams);
    applyParsedFilters(parsed, {
      setPageNumber,
      setCurrentSortingOption,
      setListingStatus,
      setPropertyTypes,
      setPriceRange,
      setBedrooms,
      setLocation,
      setSearchInput,
      setDiscoveryMode,
    });
    isApplyingUrl.current = false;
  }, [urlKey, searchParams, setSearchInput]);

  const queryParams = useMemo(
    () =>
      buildListingQueryParams({
        page: pageNumber,
        limit: pageSize,
        currentSortingOption,
        listingStatus,
        propertyTypes,
        priceRange,
        bedrooms,
        location,
        searchQuery,
      }),
    [
      pageNumber,
      pageSize,
      currentSortingOption,
      listingStatus,
      propertyTypes,
      priceRange,
      bedrooms,
      location,
      searchQuery,
    ],
  );

  useEffect(() => {
    if (isApplyingUrl.current) return;

    const params = buildListingSearchParams({
      page: pageNumber,
      currentSortingOption,
      listingStatus,
      discoveryMode,
      propertyTypes,
      priceRange,
      bedrooms,
      location,
      searchQuery,
    });
    const nextKey = params.toString();
    if (nextKey === urlKey) return;

    const nextUrl = nextKey ? `${basePath}?${nextKey}` : basePath;
    router.replace(nextUrl, { scroll: false });
  }, [
    router,
    basePath,
    urlKey,
    pageNumber,
    currentSortingOption,
    listingStatus,
    discoveryMode,
    propertyTypes,
    priceRange,
    bedrooms,
    location,
    searchQuery,
  ]);

  const projectQueryParams = useMemo(
    () =>
      buildProjectQueryParams({
        page: pageNumber,
        limit: pageSize,
        currentSortingOption,
        listingStatus,
        location,
        searchQuery,
      }),
    [
      pageNumber,
      pageSize,
      currentSortingOption,
      listingStatus,
      location,
      searchQuery,
    ],
  );

  const unitsQuery = useProperties(queryParams, {
    enabled: discoveryMode === "units",
  });
  const projectsQuery = useProjects(projectQueryParams, {
    enabled: discoveryMode === "projects",
  });

  const activeQuery = discoveryMode === "projects" ? projectsQuery : unitsQuery;
  const { isLoading, isError, isFetching } = activeQuery;

  const cards = activeQuery.data?.cards || [];
  const pagination = activeQuery.data?.pagination;
  const pageContentTrac = getListingPageRange(
    pageNumber,
    pageSize,
    pagination?.total,
  );

  const resetFilter = useCallback(() => {
    setListingStatus("All");
    setPropertyTypes([]);
    setPriceRange([0, LISTING_MAX_PRICE]);
    setBedrooms(0);
    setBathrooms(0);
    setLocation("All Cities");
    setSquareFeet([]);
    setYearBuild([0, 2050]);
    setCategories([]);
    setCurrentSortingOption("Newest");
    setSearchInput("");
    setPageNumber(1);

    document.querySelectorAll(".filterInput").forEach((element) => {
      element.value = null;
    });

    document.querySelectorAll(".filterSelect").forEach((element) => {
      element.value = "All Cities";
    });
  }, [setSearchInput]);

  const handleListingStatus = useCallback(
    (value) => {
      resetPage();
      setListingStatus((current) => (current === value ? "All" : value));
    },
    [resetPage],
  );

  const handleDiscoveryMode = useCallback(
    (mode) => {
      resetPage();
      setDiscoveryMode(mode === "projects" ? "projects" : "units");
    },
    [resetPage],
  );

  const handlePropertyTypes = useCallback(
    (value) => {
      resetPage();
      if (value === "All") {
        setPropertyTypes([]);
        return;
      }

      setPropertyTypes((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      );
    },
    [resetPage],
  );

  const handlePriceRange = useCallback(
    (value) => {
      resetPage();
      setPriceRange(value);
    },
    [resetPage],
  );

  const handleBedrooms = useCallback(
    (value) => {
      resetPage();
      setBedrooms(value);
    },
    [resetPage],
  );

  const handleBathrooms = useCallback(
    (value) => {
      resetPage();
      setBathrooms(value);
    },
    [resetPage],
  );

  const handleLocation = useCallback(
    (value) => {
      resetPage();
      setLocation(value);
    },
    [resetPage],
  );

  const handleSquareFeet = useCallback(
    (value) => {
      resetPage();
      setSquareFeet(value);
    },
    [resetPage],
  );

  const handleYearBuild = useCallback(
    (value) => {
      resetPage();
      setYearBuild(value);
    },
    [resetPage],
  );

  const handleCategories = useCallback(
    (value) => {
      resetPage();
      if (value === "All") {
        setCategories([]);
        return;
      }

      setCategories((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      );
    },
    [resetPage],
  );

  const handleSortingOption = useCallback(
    (option) => {
      resetPage();
      setCurrentSortingOption(option);
    },
    [resetPage],
  );

  const filterFunctions = {
    handlelistingStatus: handleListingStatus,
    handlepropertyTypes: handlePropertyTypes,
    handlepriceRange: handlePriceRange,
    handlebedrooms: handleBedrooms,
    handlebathroms: handleBathrooms,
    handlelocation: handleLocation,
    handlesquirefeet: handleSquareFeet,
    handleyearBuild: handleYearBuild,
    handlecategories: handleCategories,
    priceRange,
    listingStatus,
    propertyTypes,
    resetFilter,
    discoveryMode,
    handleDiscoveryMode,
    bedrooms,
    bathroms: bathrooms,
    location,
    squirefeet: squareFeet,
    yearBuild,
    categories,
    setPropertyTypes,
    searchInput,
    setSearchQuery: setSearchInput,
  };

  return {
    pageNumber,
    setPageNumber,
    currentSortingOption,
    setCurrentSortingOption: handleSortingOption,
    filterFunctions,
    queryParams,
    cards,
    pagination,
    pageContentTrac,
    isLoading,
    isError,
    isFetching,
    listingStatus,
    discoveryMode,
    setDiscoveryMode: handleDiscoveryMode,
    location,
    searchQuery,
    pageSize,
  };
}
