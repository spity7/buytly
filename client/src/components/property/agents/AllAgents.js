import Image from "next/image";
import Link from "next/link";
import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";

const AllAgents = ({ data }) => {
  return (
    <>
      {data.map((agent) => (
        <div className="col" key={agent.id}>
          <div className="feature-style2 mb30">
            <div className="feature-img">
              <Link href={`/agent-single/${agent.id}`}>
                <Image
                  width={210}
                  height={240}
                  className="bdrs12 w-100 h-100 cover"
                  src={agent.image}
                  alt={agent.name}
                  unoptimized={isExternalImageSrc(agent.image)}
                />
              </Link>
            </div>
            <div className="feature-content pt20">
              <h6 className="title mb-1">
                <Link href={`/agent-single/${agent.id}`}>{agent.name}</Link>
              </h6>
              <p className="text fz15 mb-0">
                {agent.agency || "Real Estate Agent"}
              </p>
              {agent.city ? (
                <p className="text fz14 mb-0">{agent.city}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AllAgents;
