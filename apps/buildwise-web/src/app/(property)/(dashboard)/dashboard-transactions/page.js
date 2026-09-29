import TransactionsDataTable from "@/components/property/dashboard/dashboard-transactions/TransactionsDataTable";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata = {
  title: "My Transactions",
};

export default function DashboardTransactionsPage() {
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
            <h2>Transactions</h2>
            <p className="text">
              Track purchase and rental transactions. Completing a transaction
              marks the property as sold or rented.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <TransactionsDataTable />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
