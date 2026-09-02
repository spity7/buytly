import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import ListingBrowsePanel from "@/components/listing/shared/ListingBrowsePanel";

export const metadata = {
  title: "Browse Properties | Buytly",
  description: "Search and filter active property listings for sale and rent.",
};

export default function ListingsPage() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />
      <ListingBrowsePanel />
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}
