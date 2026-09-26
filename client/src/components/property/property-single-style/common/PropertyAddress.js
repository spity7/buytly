"use client";

import PropertyLocationMap from "@/components/property/property-single-style/common/PropertyLocationMap";
import LocationAddressFields from "@/components/property/property-single-style/common/LocationAddressFields";
import { hasPropertyMapCoordinates } from "@/lib/geo/propertyCoordinates";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const PropertyAddress = () => {
  const { property } = usePropertySingle();
  const location = property?.location;
  const showMap = location && hasPropertyMapCoordinates(location);

  return (
    <>
      <div className="col-12">
        <LocationAddressFields location={location} />
      </div>

      {showMap ? (
        <div className="col-md-12">
          <PropertyLocationMap />
        </div>
      ) : null}
    </>
  );
};

export default PropertyAddress;
