"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { getDashboardNavSections } from "@/lib/dashboard/navSections";
import { useAuth } from "@/providers/AuthProvider";

const DboardMobileNavigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const sidebarItems = getDashboardNavSections(user?.role);

  return (
    <div className="dashboard_navigationbar d-block d-lg-none">
      <div className="dropdown">
        <button
          className="dropbtn"
          onClick={() => setIsDropdownOpen((prevOpen) => !prevOpen)}
        >
          <i className="fa fa-bars pr10" /> Dashboard Navigation
        </button>
        <ul className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}>
          {sidebarItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <p
                className={`fz15 fw400 ff-heading mt30 pl30 ${
                  sectionIndex === 0 ? "mt-0" : "mt30"
                }`}
              >
                {section.title}
              </p>
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="sidebar_list_item">
                  {item.logout ? (
                    <LogoutButton
                      as="a"
                      className={`items-center   ${
                        pathname == item.href ? "-is-active" : ""
                      } `}
                    >
                      <i className={`${item.icon} mr15`} />
                      {item.text}
                    </LogoutButton>
                  ) : (
                    <Link
                      href={item.href}
                      className={`items-center   ${
                        pathname == item.href ? "-is-active" : ""
                      } `}
                    >
                      <i className={`${item.icon} mr15`} />
                      {item.text}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DboardMobileNavigation;
