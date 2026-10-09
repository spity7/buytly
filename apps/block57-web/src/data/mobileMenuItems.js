import { siteNavItems } from "@/data/navItems";

const mobileMenuItems = siteNavItems.map(({ href, label }) => ({
  label,
  path: href,
}));

export default mobileMenuItems;
