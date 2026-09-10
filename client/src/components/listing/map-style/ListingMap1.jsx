"use client";

import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { remoteImageProps } from "@/lib/images/remoteImage";

const DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 };

const option = {
  zoomControl: true,
  disableDefaultUI: true,
  styles: [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }],
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }],
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7b7b7b" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#46bcec" }, { visibility: "on" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c8d7d4" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#070707" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
  ],
  scrollwheel: true,
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

function hasCoordinates(marker) {
  return (
    typeof marker?.lat === "number" &&
    typeof marker?.lng === "number" &&
    !Number.isNaN(marker.lat) &&
    !Number.isNaN(marker.lng)
  );
}

function computeMapCenter(markers) {
  const positioned = markers.filter(hasCoordinates);
  if (positioned.length === 0) return DEFAULT_CENTER;

  const totals = positioned.reduce(
    (acc, marker) => ({
      lat: acc.lat + marker.lat,
      lng: acc.lng + marker.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: totals.lat / positioned.length,
    lng: totals.lng / positioned.length,
  };
}

export default function ListingMap1({ markers = [] }) {
  if (!googleMapsApiKey) {
    return (
      <p className="text-center text-muted py-4 mb-0">
        Map is not configured. Set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
        in your environment.
      </p>
    );
  }

  return (
    <ListingMapContent googleMapsApiKey={googleMapsApiKey} markers={markers} />
  );
}

function ListingMapContent({ googleMapsApiKey, markers }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const { isLoaded } = useLoadScript({ googleMapsApiKey });

  const positionedMarkers = useMemo(
    () => markers.filter(hasCoordinates),
    [markers],
  );

  const center = useMemo(
    () => computeMapCenter(positionedMarkers),
    [positionedMarkers],
  );

  const zoom = positionedMarkers.length === 1 ? 13 : positionedMarkers.length ? 11 : 10;

  if (!isLoaded) {
    return <p className="text-center text-muted py-4 mb-0">Loading map...</p>;
  }

  if (positionedMarkers.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bgc-f7">
        <p className="text-muted mb-0 px-3 text-center">
          No mappable listings in this result set.
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={option}
    >
      <MarkerClusterer>
        {(clusterer) =>
          positionedMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              clusterer={clusterer}
              onClick={() => setActiveMarker(marker)}
            />
          ))
        }
      </MarkerClusterer>

      {activeMarker && (
        <InfoWindow
          position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
          onCloseClick={() => setActiveMarker(null)}
        >
          <div style={{ maxWidth: 280 }}>
            <div className="listing-style1">
              <div className="list-thumb">
                <Image
                  width={280}
                  height={180}
                  className="w-100 cover"
                  src={activeMarker.image}
                  alt={activeMarker.title}
                  {...remoteImageProps(activeMarker.image)}
                />
                <div className="list-price">{activeMarker.price}</div>
              </div>
              <div className="list-content">
                <h6 className="list-title">
                  <Link href={`/single-v1/${activeMarker.id}`}>
                    {activeMarker.title}
                  </Link>
                </h6>
                <p className="list-text mb-0">{activeMarker.location}</p>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
