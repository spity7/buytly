"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import EnergyClass from "@/components/property/property-single-style/common/EnergyClass";
import FloorPlans from "@/components/property/property-single-style/common/FloorPlans";
import HomeValueChart from "@/components/property/property-single-style/common/HomeValueChart";
import InfoWithForm from "@/components/property/property-single-style/common/more-info";
import NearbySimilarProperty from "@/components/property/property-single-style/common/NearbySimilarProperty";
import OverView from "@/components/property/property-single-style/common/OverView";
import PropertyAddress from "@/components/property/property-single-style/common/PropertyAddress";
import PropertyDetails from "@/components/property/property-single-style/common/PropertyDetails";
import PropertyFeaturesAminites from "@/components/property/property-single-style/common/PropertyFeaturesAminites";
import PropertyHeader from "@/components/property/property-single-style/common/PropertyHeader";
import PropertyNearby from "@/components/property/property-single-style/common/PropertyNearby";
import PropertyVideo from "@/components/property/property-single-style/common/PropertyVideo";
import PropertyViews from "@/components/property/property-single-style/common/property-view";
import ProperytyDescriptions from "@/components/property/property-single-style/common/ProperytyDescriptions";
import ReviewBoxForm from "@/components/property/property-single-style/common/ReviewBoxForm";
import VirtualTour360 from "@/components/property/property-single-style/common/VirtualTour360";
import AllReviews from "@/components/property/property-single-style/common/reviews";
import ContactWithAgent from "@/components/property/property-single-style/sidebar/ContactWithAgent";
import ScheduleTour from "@/components/property/property-single-style/sidebar/ScheduleTour";
import PropertyGallery from "@/components/property/property-single-style/single-v1/PropertyGallery";
import PropertySingleShell from "@/components/property/property-single-style/PropertySingleShell";
import { PropertySingleProvider } from "@/providers/PropertySingleProvider";
import MortgageCalculator from "@/components/property/property-single-style/common/MortgageCalculator";
import WalkScore from "@/components/property/property-single-style/common/WalkScore";

export default function SingleV1Client({ id }) {
  return (
    <PropertySingleProvider id={id}>
      <>
        <DefaultHeader />
        <MobileMenu />

        <PropertySingleShell>
          <section className="pt60 pb90 bgc-f7">
            <div className="container">
              <div className="row">
                <PropertyHeader />
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
                    <h4 className="title fz17 mb30">
                      Features &amp; Amenities
                    </h4>
                    <div className="row">
                      <PropertyFeaturesAminites />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Energy Class</h4>
                    <div className="row">
                      <EnergyClass />
                    </div>
                  </div>

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

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 ">
                    <h4 className="title fz17 mb30">Video</h4>
                    <div className="row">
                      <PropertyVideo />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">360° Virtual Tour</h4>
                    <div className="row">
                      <VirtualTour360 />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">What&apos;s Nearby?</h4>
                    <div className="row">
                      <PropertyNearby />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Walkscore</h4>
                    <div className="row">
                      <div className="col-md-12">
                        <WalkScore />
                      </div>
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Mortgage Calculator</h4>
                    <div className="row">
                      <MortgageCalculator />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <div className="row">
                      <PropertyViews />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Home Value</h4>
                    <div className="row">
                      <HomeValueChart />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Get More Information</h4>
                    <InfoWithForm />
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <div className="row">
                      <AllReviews />
                    </div>
                  </div>

                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Leave A Review</h4>
                    <div className="row">
                      <ReviewBoxForm />
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="column">
                    <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white position-relative">
                      <h4 className="form-title mb5">Schedule a tour</h4>
                      <p className="text">Choose your preferred day</p>
                      <ScheduleTour />
                    </div>

                    <div className="agen-personal-info position-relative bgc-white default-box-shadow1 bdrs12 p30 mt30">
                      <div className="widget-wrapper mb-0">
                        <h6 className="title fz17 mb30">
                          Get More Information
                        </h6>
                        <ContactWithAgent />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt30 align-items-center justify-content-between">
                <div className="col-auto">
                  <div className="main-title">
                    <h2 className="title">Discover Our Featured Listings</h2>
                    <p className="paragraph">Similar properties you may like</p>
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
    </PropertySingleProvider>
  );
}
