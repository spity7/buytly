import Pagination from "@/components/property/Pagination";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import ListingsFavourites from "@/components/property/dashboard/dashboard-my-favourites/ListingsFavourites";

export const metadata = {
  title: "Dashboard My Favourites",
};

const DashboardMyFavourites = () => {
  return (
    <>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <div className="row align-items-center pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>My Favourites</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
      </div>

      <div className="row">
        <ListingsFavourites />
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="mt30">
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMyFavourites;
