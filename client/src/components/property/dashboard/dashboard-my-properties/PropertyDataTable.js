"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { buytlyApi } from "@/api/generated";
import { useMyProperties } from "@/hooks/useMyProperties";
import { getApiError } from "@/lib/auth/getApiError";
import { getStatusClass, getStatusLabel } from "@/lib/properties/mapProperty";
import { notifyError, notifySuccess } from "@/lib/toast";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useQueryClient } from "@tanstack/react-query";

const PLACEHOLDER = "/images/listings/list-1.jpg";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const PropertyDataTable = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useMyProperties({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [deletingId, setDeletingId] = useState(null);

  const properties = data?.properties || [];
  const cards = data?.cards || [];

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Delete this property listing?")) return;

    setDeletingId(propertyId);
    try {
      await buytlyApi.deleteProperty(propertyId);
      notifySuccess("Property deleted");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="packages_table table-responsive">
        <DashboardTableSkeleton rows={5} columns={5} withThumbnail />
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-danger">Failed to load your properties.</p>;
  }

  if (!properties.length) {
    return (
      <div className="p-4">
        <p>You have no listings yet.</p>
        <Link href="/dashboard-add-property" className="ud-btn btn-thm">
          Add your first property
        </Link>
      </div>
    );
  }

  return (
    <table className="table-style3 table at-savesearch">
      <thead className="t-head">
        <tr>
          <th scope="col">Listing title</th>
          <th scope="col">Date Published</th>
          <th scope="col">Status</th>
          <th scope="col">Views</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody className="t-body">
        {properties.map((property, index) => {
          const card = cards[index];
          const propertyId = property._id;

          return (
            <tr key={propertyId}>
              <th scope="row">
                <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                  <div className="list-thumb">
                    <Image
                      width={110}
                      height={94}
                      className="w-100"
                      src={card?.image || PLACEHOLDER}
                      alt="property"
                    />
                  </div>
                  <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                    <div className="h6 list-title">
                      <Link href={`/single-v1/${propertyId}`}>
                        {property.title}
                      </Link>
                    </div>
                    <p className="list-text mb-0">{card?.location}</p>
                    <div className="list-price">
                      <span>{card?.price}</span>
                    </div>
                  </div>
                </div>
              </th>
              <td className="vam">{formatDate(property.createdAt)}</td>
              <td className="vam">
                <span className={getStatusClass(property.status)}>
                  {getStatusLabel(property.status)}
                </span>
              </td>
              <td className="vam">{property.viewCount ?? 0}</td>
              <td className="vam">
                <div className="d-flex">
                  <Link
                    href={`/dashboard-edit-property/${propertyId}`}
                    className="icon"
                    data-tooltip-id={`edit-${propertyId}`}
                  >
                    <span className="fas fa-pen fa" />
                  </Link>
                  <button
                    className="icon"
                    style={{ border: "none" }}
                    data-tooltip-id={`delete-${propertyId}`}
                    onClick={() => handleDelete(propertyId)}
                    disabled={deletingId === propertyId}
                  >
                    <span className="flaticon-bin" />
                  </button>

                  <ReactTooltip
                    id={`edit-${propertyId}`}
                    place="top"
                    content="Edit"
                  />
                  <ReactTooltip
                    id={`delete-${propertyId}`}
                    place="top"
                    content="Delete"
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PropertyDataTable;
