import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";

export const metadata = {
  title: "Notifications | Dashboard",
};

const DashboardNotifications = () => {
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
            <h2>Notifications</h2>
            <p className="text mb0">
              View and manage alerts for bookings, transactions, listings, and
              your account.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <NotificationsPanel />
        </div>
      </div>
    </>
  );
};

export default DashboardNotifications;
