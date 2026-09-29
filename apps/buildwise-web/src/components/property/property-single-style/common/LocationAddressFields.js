"use client";

function AddressRow({ label, value }) {
  return (
    <div className="property-detail-row">
      <p className="property-detail-row__label fw600 ff-heading dark-color">
        {label}:
      </p>
      <p className="property-detail-row__value text">{value || "—"}</p>
    </div>
  );
}

/** Address / city / country in the same 2-column grid as Property Details. */
export default function LocationAddressFields({ location }) {
  if (!location) {
    return <p className="text mb0">Address not available.</p>;
  }

  return (
    <div className="property-details-grid">
      <div className="property-details-column">
        <AddressRow label="Address" value={location.address} />
        <AddressRow label="Country" value={location.country} />
      </div>
      <div className="property-details-column">
        <AddressRow label="City" value={location.city} />
      </div>
    </div>
  );
}
