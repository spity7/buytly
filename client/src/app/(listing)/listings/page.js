import { Suspense } from "react";
import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import ListingBrowsePanel from "@/components/listing/shared/ListingBrowsePanel";

export const metadata = {
  title: "Browse Properties | Buytly",
  description: "Search and filter active property listings for sale and rent.",
};

function ListingsFallback() {
  return (
    <section className="pt0 pb90 bgc-f7">
      <div className="container">
        <p className="text mb0">Loading listings...</p>
      </div>
    </section>
  );
}

export default function ListingsPage() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />
      <Suspense fallback={<ListingsFallback />}>
        <ListingBrowsePanel />
      </Suspense>
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}
