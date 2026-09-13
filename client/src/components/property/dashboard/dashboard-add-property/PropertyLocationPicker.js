"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { LEBANON_MAP_CENTER } from "@/lib/geo/lebanonDefaults";
import { parseLatLngStrings } from "@/lib/geo/propertyCoordinates";

const DEFAULT_CENTER = LEBANON_MAP_CENTER;

const mapContainerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "12px",
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

export default function PropertyLocationPicker({
  latitude,
  longitude,
  onChange,
  disabled = false,
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
  });

  const mapRef = useRef(null);

  const position = useMemo(
    () => parseLatLngStrings(latitude, longitude),
    [latitude, longitude],
  );

  const center = position || DEFAULT_CENTER;
  const zoom = position ? 14 : 11;

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!position || !isLoaded || !mapRef.current) return;
    mapRef.current.panTo(position);
    mapRef.current.setZoom(14);
  }, [position, isLoaded]);

  if (!googleMapsApiKey) {
    return (
      <div className="alert alert-warning mb0">
        Map picker is not configured. Set{" "}
        <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{" "}
        <code>client/.env.local</code>.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="alert alert-danger mb0">
        Failed to load Google Maps. Check your API key and billing settings.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="bdr1 bdrs12 d-flex align-items-center justify-content-center text"
        style={{ height: "320px" }}
      >
        Loading map…
      </div>
    );
  }

  const handleMapClick = (event) => {
    if (disabled || !event.latLng) return;
    onChange({
      latitude: event.latLng.lat().toFixed(6),
      longitude: event.latLng.lng().toFixed(6),
    });
  };

  return (
    <div>
      <p className="text mb15">
        Click the map to set the listing location. Latitude and longitude are
        filled automatically.
      </p>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {position ? (
          <Marker
            position={position}
            draggable={!disabled}
            onDragEnd={(event) => {
              if (disabled || !event.latLng) return;
              onChange({
                latitude: event.latLng.lat().toFixed(6),
                longitude: event.latLng.lng().toFixed(6),
              });
            }}
          />
        ) : null}
      </GoogleMap>
      {position ? (
        <p className="text mt15 mb0">
          Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text mt15 mb0">No location selected yet.</p>
      )}
    </div>
  );
}
