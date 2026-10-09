import mobileMenuItems from "@/data/mobileMenuItems";
import { listingItems } from "@/data/navItems";
import { isParentActive } from "@/utilis/isMenuActive";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

const listingPaths = listingItems.flatMap((item) =>
  item.submenu.map((sub) => ({ path: sub.href })),
);

const isTopLevelLinkActive = (item, currentPath) => {
  if (item.path === "/") {
    return currentPath === "/" || currentPath.startsWith("/home-v");
  }
  if (item.path === "/listings") {
    return (
      isParentActive(listingPaths, currentPath) || currentPath === "/listings"
    );
  }
  return item.path === currentPath;
};

const ProSidebarContent = () => {
  const path = usePathname();

  return (
    <Sidebar width="100%" backgroundColor="#fff" className="my-custom-class">
      <Menu>
        {mobileMenuItems.map((item, index) =>
          item.path ? (
            <MenuItem
              key={index}
              className={isTopLevelLinkActive(item, path) ? "active" : ""}
              component={
                <Link
                  className={isTopLevelLinkActive(item, path) ? "active" : ""}
                  href={item.path}
                />
              }
            >
              {item.label}
            </MenuItem>
          ) : (
            <SubMenu
              key={index}
              className={isParentActive(item.subMenu, path) ? "active" : ""}
              label={item.label}
            >
              {item.subMenu.map((subItem, subIndex) =>
                subItem.subMenu ? (
                  <SubMenu
                    key={subIndex}
                    label={subItem.label}
                    className={
                      isParentActive(subItem.subMenu, path) ? "active" : ""
                    }
                  >
                    {subItem.subMenu.map((nestedItem, nestedIndex) => (
                      <MenuItem
                        key={nestedIndex}
                        component={
                          <Link
                            className={nestedItem.path == path ? "active" : ""}
                            href={nestedItem.path}
                          />
                        }
                      >
                        {nestedItem.label}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem
                    key={subIndex}
                    component={
                      <Link
                        className={subItem.path == path ? "active" : ""}
                        href={subItem.path}
                      />
                    }
                  >
                    {subItem.label}
                  </MenuItem>
                ),
              )}
            </SubMenu>
          ),
        )}
      </Menu>
    </Sidebar>
  );
};

export default ProSidebarContent;
