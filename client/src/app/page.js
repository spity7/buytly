import Home_V1 from "./(home)/home-v1/page";
import Wrapper from "./layout-wrapper/wrapper";
import { homePageMetadata } from "@/lib/siteMetadata";

export const metadata = homePageMetadata();

export default function MainRoot() {
  return (
    <Wrapper>
      <Home_V1 />
    </Wrapper>
  );
}
