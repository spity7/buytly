import BookingsDataTable from "@/components/property/dashboard/dashboard-bookings/BookingsDataTable";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata = {
  title: "My Bookings",
};

export default function DashboardBookingsPage() {
  return (
    <RequireAuth>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <div className="row align-items-center pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Bookings</h2>
            <p className="text">
              Manage property visit requests and your scheduled tours.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <BookingsDataTable />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
