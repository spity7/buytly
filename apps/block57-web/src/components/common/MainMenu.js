import { siteNavItems } from "@/data/navItems";
import { isPathActive } from "@/lib/url/normalizePath";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MainMenu = () => {
  const pathname = usePathname();

  return (
    <ul className="ace-responsive-menu">
      {siteNavItems.map((item) => (
        <li className="visible_list" key={item.href}>
          <Link className="list-item" href={item.href}>
            <span
              className={
                isPathActive(pathname, item.href) ? "title menuActive" : "title"
              }
            >
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default MainMenu;
