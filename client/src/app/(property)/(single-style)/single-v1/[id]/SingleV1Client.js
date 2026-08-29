"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import FloorPlans from "@/components/property/property-single-style/common/FloorPlans";
import MortgageCalculator from "@/components/property/property-single-style/common/MortgageCalculator";
import NearbySimilarProperty from "@/components/property/property-single-style/common/NearbySimilarProperty";
import OverView from "@/components/property/property-single-style/common/OverView";
import PropertyAddress from "@/components/property/property-single-style/common/PropertyAddress";
import PropertyDetails from "@/components/property/property-single-style/common/PropertyDetails";
import PropertyFeaturesAminites from "@/components/property/property-single-style/common/PropertyFeaturesAminites";
import PropertyHeader from "@/components/property/property-single-style/common/PropertyHeader";
import PropertyStatusBanner from "@/components/property/property-single-style/common/PropertyStatusBanner";
import PropertyVideo from "@/components/property/property-single-style/common/PropertyVideo";
import ProperytyDescriptions from "@/components/property/property-single-style/common/ProperytyDescriptions";
import ReviewBoxForm from "@/components/property/property-single-style/common/ReviewBoxForm";
import VirtualTour360 from "@/components/property/property-single-style/common/VirtualTour360";
import AllReviews from "@/components/property/property-single-style/common/reviews";
import ContactWithAgent from "@/components/property/property-single-style/sidebar/ContactWithAgent";
import ScheduleTour from "@/components/property/property-single-style/sidebar/ScheduleTour";
import StartTransaction from "@/components/property/property-single-style/sidebar/StartTransaction";
import PropertyGallery from "@/components/property/property-single-style/single-v1/PropertyGallery";
import PropertySingleShell from "@/components/property/property-single-style/PropertySingleShell";
import { usePropertyReviewStatus } from "@/hooks/usePropertyReviews";
import { isPropertyBookable } from "@/lib/properties/mapProperty";
import {
  PropertySingleProvider,
  usePropertySingle,
} from "@/providers/PropertySingleProvider";

function FloorPlansSection() {
  const { property } = usePropertySingle();
  if (!property?.floorPlans?.length) return null;

  return (
    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
      <h4 className="title fz17 mb30">Floor Plans</h4>
      <div className="row">
        <div className="col-md-12">
          <div className="accordion-style1 style2">
            <FloorPlans />
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyVideoSection() {
  const { property } = usePropertySingle();
  const hasVideo = property?.media?.some(
    (item) => item.type === "video" && item.url,
  );
  if (!hasVideo) return null;

  return (
    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30">
      <h4 className="title fz17 mb30">Video</h4>
      <div className="row">
        <PropertyVideo />
      </div>
    </div>
  );
}

function VirtualTourSection() {
  const { property } = usePropertySingle();
  if (!property?.virtualTourUrl) return null;

  return (
    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
      <h4 className="title fz17 mb30">360° Virtual Tour</h4>
      <div className="row">
        <VirtualTour360 />
      </div>
    </div>
  );
}

function LeaveReviewSection() {
  const { id, property } = usePropertySingle();
  const { data: hasReviewed = false, isLoading } = usePropertyReviewStatus(id);

  if (!isPropertyBookable(property?.status)) return null;
  if (isLoading || hasReviewed) return null;

  return (
    <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
      <h4 className="title fz17 mb30">Leave A Review</h4>
      <div className="row">
        <ReviewBoxForm />
      </div>
    </div>
  );
}

function SingleV1Content() {
  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <PropertySingleShell>
        <section className="pt60 pb90 bgc-f7">
          <div className="container">
            <div className="row">
              <PropertyHeader />
            </div>

            <div className="row mt20">
              <div className="col-12">
                <PropertyStatusBanner />
              </div>
            </div>

            <div className="row mb30 mt30">
              <PropertyGallery />
            </div>

            <div className="row wrap">
              <div className="col-lg-8">
                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Overview</h4>
                  <div className="row">
                    <OverView />
                  </div>
                </div>

                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Property Description</h4>
                  <ProperytyDescriptions />
                  <h4 className="title fz17 mb30 mt50">Property Details</h4>
                  <div className="row">
                    <PropertyDetails />
                  </div>
                </div>

                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30 mt30">Address</h4>
                  <div className="row">
                    <PropertyAddress />
                  </div>
                </div>

                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Features &amp; Amenities</h4>
                  <div className="row">
                    <PropertyFeaturesAminites />
                  </div>
                </div>

                <FloorPlansSection />
                <PropertyVideoSection />
                <VirtualTourSection />

                <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <h4 className="title fz17 mb30">Mortgage Calculator</h4>
                  <div className="row">
                    <MortgageCalculator />
                  </div>
                </div>

                <div
                  id="property-reviews"
                  className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative"
                >
                  <div className="row">
                    <AllReviews />
                  </div>
                </div>

                <LeaveReviewSection />
              </div>

              <div className="col-lg-4">
                <div className="column">
                  <StartTransaction />

                  <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white position-relative">
                    <h4 className="form-title mb5">Schedule a tour</h4>
                    <p className="text">Choose your preferred day</p>
                    <ScheduleTour />
                  </div>

                  <div className="agen-personal-info position-relative bgc-white default-box-shadow1 bdrs12 p30 mt30">
                    <div className="widget-wrapper mb-0">
                      <h6 className="title fz17 mb30">Listing Contact</h6>
                      <ContactWithAgent />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt30 align-items-center justify-content-between">
              <div className="col-auto">
                <div className="main-title">
                  <h2 className="title">Similar Listings</h2>
                  <p className="paragraph">Properties you may like</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="property-city-slider">
                  <NearbySimilarProperty />
                </div>
              </div>
            </div>
          </div>
        </section>
      </PropertySingleShell>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}

export default function SingleV1Client({ id }) {
  return (
    <PropertySingleProvider id={id}>
      <SingleV1Content />
    </PropertySingleProvider>
  );
}
