"use client";

import { useProperty } from "@/hooks/useProperty";
import { createContext, useContext } from "react";

const PropertySingleContext = createContext(null);

export function PropertySingleProvider({ id, children }) {
  const { data, isLoading, isError, error } = useProperty(id);

  return (
    <PropertySingleContext.Provider
      value={{
        id,
        property: data?.property,
        card: data?.card,
        isLoading,
        isError,
        error,
      }}
    >
      {children}
    </PropertySingleContext.Provider>
  );
}

export function usePropertySingle() {
  return useContext(PropertySingleContext);
}
