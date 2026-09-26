"use client";

import { useProjectBySlug } from "@/hooks/useProjects";
import { createContext, useContext } from "react";

const ProjectSingleContext = createContext(null);

export function ProjectSingleProvider({ slug, children }) {
  const { data: project, isLoading, isError, error } = useProjectBySlug(slug);

  return (
    <ProjectSingleContext.Provider
      value={{
        slug,
        project,
        isLoading,
        isError,
        error,
      }}
    >
      {children}
    </ProjectSingleContext.Provider>
  );
}

export function useProjectSingle() {
  return useContext(ProjectSingleContext);
}
