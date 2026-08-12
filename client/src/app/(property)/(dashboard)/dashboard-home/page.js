import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import RecentActivities from "@/components/property/dashboard/dashboard-home/RecentActivities";
import TopStateBlock from "@/components/property/dashboard/dashboard-home/TopStateBlock";
import PropertyViews from "@/components/property/dashboard/dashboard-home/property-view";

export const metadata = {
  title: "Dashboard Home",
};

const DashboardHome = () => {
  return (
    <>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>

        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Howdy, Ali!</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
      </div>

      <div className="row">
        <TopStateBlock />
      </div>

      <div className="row">
        <div className="col-xl-8">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="row">
              <PropertyViews />
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb25">Recent Activities</h4>
            <RecentActivities />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
