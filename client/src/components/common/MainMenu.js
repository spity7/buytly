import { homeItems, listingItems } from "@/data/navItems";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MainMenu = () => {
  const pathname = usePathname();
  const [topMenu, setTopMenu] = useState("");

  useEffect(() => {
    homeItems.forEach((elm) => {
      if (elm.href.split("/")[1] == pathname.split("/")[1]) {
        setTopMenu("home");
      }
    });
    listingItems.forEach((item) =>
      item.submenu.forEach((elm) => {
        if (elm.href.split("/")[1] == pathname.split("/")[1]) {
          setTopMenu("listing");
        }
      }),
    );
    if (pathname.split("/")[1] === "listings") {
      setTopMenu("listing");
    }
    if (pathname.split("/")[1] === "contact") {
      setTopMenu("contact");
    }
  }, [pathname]);

  return (
    <ul className="ace-responsive-menu">
      <li className="visible_list">
        <Link className="list-item" href="/">
          <span className={topMenu == "home" ? "title menuActive" : "title"}>
            Home
          </span>
        </Link>
      </li>
      {/* End homeItems */}

      <li className="visible_list">
        <Link className="list-item" href="/listings">
          <span className={topMenu == "listing" ? "title menuActive" : "title"}>
            Listing
          </span>
        </Link>
      </li>
      {/* End listings */}

      <li className="visible_list">
        <Link className="list-item" href="/contact">
          <span className={topMenu == "contact" ? "title menuActive" : "title"}>
            Contact
          </span>
        </Link>
      </li>
      {/* End contact */}
    </ul>
  );
};

export default MainMenu;
