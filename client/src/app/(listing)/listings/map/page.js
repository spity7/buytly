import { Suspense } from "react";
import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import ListingMapBrowsePanel from "@/components/listing/shared/ListingMapBrowsePanel";

export const metadata = {
  title: "Map View | Buytly",
  description: "Browse property listings on an interactive map.",
};

function MapListingsFallback() {
  return (
    <section className="p-0 bgc-f7">
      <div className="container-fluid">
        <p className="text mb0 px-3 py-4">Loading map listings...</p>
      </div>
    </section>
  );
}

export default function ListingsMapPage() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />
      <Suspense fallback={<MapListingsFallback />}>
        <ListingMapBrowsePanel />
      </Suspense>
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}
