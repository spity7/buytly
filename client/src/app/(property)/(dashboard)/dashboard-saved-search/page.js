import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import SearchDataTable from "@/components/property/dashboard/dashboard-saved-search/SearchDataTable";

export const metadata = {
  title: "Saved Searches | Dashboard",
};

const DashboardSavedSearch = () => {
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
            <h2>Saved Searches</h2>
            <p className="text mb0">
              View and manage your saved property search filters.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <SearchDataTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSavedSearch;
