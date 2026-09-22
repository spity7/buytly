"use client";

import { useMyProjects } from "@/hooks/useProjects";
import { getStatusLabel } from "@/lib/properties/mapProperty";
import Link from "next/link";
import { useState } from "react";

export default function MyProjectsPanel() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useMyProjects({ page, limit: 20 });

  const projects = data?.projects || [];
  const pagination = data?.pagination;

  return (
    <div className="p30">
      <div className="d-flex justify-content-between align-items-center mb30">
        <h2 className="mb0">My Projects</h2>
        <Link href="/dashboard-add-project" className="ud-btn btn-thm">
          Add New Project
        </Link>
      </div>

      {isFetching && !projects.length ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p className="bdr1 bdrs12 p20">You have no projects yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table-style3 table at-savesearch">
            <thead>
              <tr>
                <th>Project</th>
                <th>Type</th>
                <th>Units</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const id = project._id || project.id;
                return (
                  <tr key={id}>
                    <td>{project.title}</td>
                    <td className="text-capitalize">{project.kind}</td>
                    <td>{project.unitCount ?? 0}</td>
                    <td>{getStatusLabel(project.status)}</td>
                    <td>
                      <Link href={`/dashboard-edit-project/${id}`}>Manage</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="d-flex gap-2 mt20">
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
