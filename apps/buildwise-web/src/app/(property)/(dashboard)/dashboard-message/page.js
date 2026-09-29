import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import ChatBoxForm from "@/components/property/dashboard/dashboard-message/ChatBoxForm";
import SearchBox from "@/components/property/dashboard/dashboard-message/SearchBox";
import UserChatBoxContent from "@/components/property/dashboard/dashboard-message/UserChatBoxContent";
import UserInboxList from "@/components/property/dashboard/dashboard-message/UserInboxList";
import Image from "next/image";

export const metadata = {
  title: "Dashboard Message",
};

const DashboardMessage = () => {
  return (
    <>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>

        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Messages</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
      </div>

      <div className="row mb40">
        <div className="col-lg-6 col-xl-5 col-xxl-4">
          <div className="message_container">
            <div className="inbox_user_list">
              <div className="iu_heading pr35">
                <div className="chat_user_search">
                  <SearchBox />
                </div>
              </div>

              <div className="chat-member-list pr20">
                <UserInboxList />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-xl-7 col-xxl-8">
          <div className="message_container mt30-md">
            <div className="user_heading px-0 mx30">
              <div className="wrap">
                <span className="contact-status online" />
                <Image
                  width={50}
                  height={50}
                  className="img-fluid mr10"
                  src="/images/inbox/ms3.png"
                  alt="ms3.png"
                />
                <div className="meta d-sm-flex justify-content-sm-between align-items-center">
                  <div className="authors">
                    <h6 className="name mb-0">Arlene McCoy</h6>
                    <p className="preview">Active</p>
                  </div>
                  <div>
                    <a
                      className="text-decoration-underline fz14 fw600 dark-color ff-heading"
                      href="#"
                    >
                      Delete Conversation
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="inbox_chatting_box">
              <ul className="chatting_content">
                <UserChatBoxContent />
              </ul>
            </div>

            <div className="mi_text">
              <div className="message_input">
                <ChatBoxForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMessage;
