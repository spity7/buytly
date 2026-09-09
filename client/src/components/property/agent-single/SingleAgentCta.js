"use client";

import Image from "next/image";
import { useAgent } from "@/hooks/useAgents";
import { mapAgentDetail } from "@/lib/agents/mapAgent";
import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";

const SOCIAL_ICONS = {
  facebook: "fab fa-facebook-f",
  twitter: "fab fa-twitter",
  instagram: "fab fa-instagram",
  linkedin: "fab fa-linkedin-in",
};

const SingleAgentCta = ({ id }) => {
  const { data, isLoading, isError } = useAgent(id);
  const agent = mapAgentDetail(data);

  if (isLoading) {
    return <p className="text mb0">Loading agent profile...</p>;
  }

  if (isError || !agent) {
    return <p className="text-danger mb0">Agent not found.</p>;
  }

  const socialEntries = Object.entries(agent.social || {}).filter(
    ([, url]) => url,
  );

  return (
    <div className="agent-single d-sm-flex align-items-center">
      <div className="single-img mb30-sm">
        <Image
          width={172}
          height={172}
          style={{ borderRadius: "50%", objectFit: "cover" }}
          src={agent.avatarUrl}
          alt={agent.name}
          unoptimized={isExternalImageSrc(agent.avatarUrl)}
        />
      </div>
      <div className="single-contant ml30 ml0-xs">
        <h2 className="title mb-0">{agent.name}</h2>
        <p className="fz15">
          {agent.agency}
          {agent.city ? ` · ${agent.city}` : ""}
        </p>
        <div className="agent-meta mb15 d-md-flex align-items-center">
          <span className="text fz15 pe-2 bdrr1">
            <i className="fas fa-star fz10 review-color2 pr10" />
            {agent.rating.toFixed(1)} · {agent.reviewCount} reviews
          </span>
          <span className="text fz15 pe-2 ps-2 bdrr1">
            <i className="flaticon-home pe-1" />
            {agent.listingsCount} listings
          </span>
          {agent.phone ? (
            <span className="text fz15 ps-2">
              <i className="flaticon-call pe-1" />
              {agent.phone}
            </span>
          ) : null}
        </div>
        {agent.bio ? <p className="text mb15">{agent.bio}</p> : null}
        {socialEntries.length ? (
          <div className="agent-social">
            {socialEntries.map(([network, url]) => (
              <a
                key={network}
                className="mr20"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <i className={SOCIAL_ICONS[network] || "fas fa-link"} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SingleAgentCta;
