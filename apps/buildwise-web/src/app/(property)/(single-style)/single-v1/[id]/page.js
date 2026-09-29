import SingleV1Client from "./SingleV1Client";

export const metadata = {
  title: "Property Single V1",
};

const SingleV1 = async (props) => {
  const params = await props.params;
  return <SingleV1Client id={params.id} />;
};

export default SingleV1;
