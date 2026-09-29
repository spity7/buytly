import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AgentProfileForm from "@/components/property/dashboard/dashboard-profile/AgentProfileForm";
import ChangePasswordForm from "@/components/property/dashboard/dashboard-profile/ChangePasswordForm";
import DeleteAccountForm from "@/components/property/dashboard/dashboard-profile/DeleteAccountForm";
import EmailVerificationBadge from "@/components/property/dashboard/dashboard-profile/EmailVerificationBadge";
import PersonalInfo from "@/components/property/dashboard/dashboard-profile/PersonalInfo";
import NotificationPreferencesForm from "@/components/notifications/NotificationPreferencesForm";
import PreferencesForm from "@/components/property/dashboard/dashboard-profile/PreferencesForm";
import ProfileBox from "@/components/property/dashboard/dashboard-profile/ProfileBox";
import SocialField from "@/components/property/dashboard/dashboard-profile/SocialField";

export const metadata = {
  title: "My Profile | Dashboard",
};

const DashboardMyProfile = () => {
  return (
    <>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <div className="row align-items-center pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area profile-title-area">
            <div>
              <h2>My Profile</h2>
              <p className="text mb0">
                Manage your account details, public presence, and security
                settings.
              </p>
            </div>
            <EmailVerificationBadge />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <div className="col-xl-7">
              <ProfileBox />
            </div>
            <div className="col-lg-12">
              <h4 className="title fz17 mb25">Personal information</h4>
              <PersonalInfo />
            </div>
          </div>

          <AgentProfileForm />

          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb30">Search preferences</h4>
            <PreferencesForm />
          </div>

          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb30">Notification preferences</h4>
            <NotificationPreferencesForm />
          </div>

          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb30">Social media</h4>
            <SocialField />
          </div>

          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb30">Change password</h4>
            <ChangePasswordForm />
          </div>

          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative delete-account-section">
            <h4 className="title fz17 mb30">Delete account</h4>
            <DeleteAccountForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMyProfile;
