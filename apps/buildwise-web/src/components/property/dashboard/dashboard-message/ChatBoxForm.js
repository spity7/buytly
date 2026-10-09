import React from "react";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

const ChatBoxForm = () => {
  return (
    <form className="d-flex align-items-center">
      <input
        className="form-control"
        type="search"
        placeholder="Type a Message"
        aria-label="Search"
        required
      />
      <button type="submit" className="btn ud-btn btn-thm">
        <DashboardBtnIcon icon={dashboardIcons.send} />
        Send message
        <DashboardBtnIcon
          icon={dashboardIcons.arrowRight}
          position="trailArrow"
        />
      </button>
    </form>
  );
};

export default ChatBoxForm;
