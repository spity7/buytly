import SingleV1Client from "./SingleV1Client";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Property Details");

const SingleV1 = async (props) => {
  const params = await props.params;
  return <SingleV1Client id={params.id} />;
};

export default SingleV1;
