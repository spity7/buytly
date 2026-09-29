"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { getDashboardNavSections } from "@/lib/dashboard/navSections";
import { useAuth } from "@/providers/AuthProvider";

const SidebarDashboard = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const sidebarItems = getDashboardNavSections(user?.role);

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <p
              className={`fz15 fw400 ff-heading ${
                sectionIndex === 0 ? "mt-0" : "mt30"
              }`}
            >
              {section.title}
            </p>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="sidebar_list_item">
                {item.logout ? (
                  <LogoutButton as="a" className="items-center">
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
      </div>
    </div>
  );
};

export default SidebarDashboard;
