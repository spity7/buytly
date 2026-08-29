"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER_AVATAR = "/images/team/agent-3.png";

function getListingContact(property) {
  const contact = property?.agentId || property?.ownerId;
  if (!contact || typeof contact === "string") return null;

  const id = contact._id || contact.id;
  const name =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Listing contact";

  return {
    id,
    name,
    phone: contact.phone,
    avatarUrl: contact.avatar?.url || PLACEHOLDER_AVATAR,
  };
}

const ContactWithAgent = () => {
  const { property } = usePropertySingle();
  const contact = getListingContact(property);

  if (!contact) {
    return <p className="text mb-0">No listing contact available.</p>;
  }

  return (
    <>
      <div className="agent-single d-sm-flex align-items-center pb25">
        <div className="single-img mb30-sm">
          <Image
            width={90}
            height={90}
            className="w90"
            src={contact.avatarUrl}
            alt={contact.name}
            {...remoteImageProps(contact.avatarUrl)}
          />
        </div>
        <div className="single-contant ml20 ml0-xs">
          <h6 className="title mb-1">{contact.name}</h6>
          {contact.phone && (
            <div className="agent-meta mb10 d-md-flex align-items-center">
              <a className="text fz15" href={`tel:${contact.phone}`}>
                <i className="flaticon-call pe-1" />
                {contact.phone}
              </a>
            </div>
          )}
          <Link
            href={`/agent-single/${contact.id}`}
            className="text-decoration-underline fw600"
          >
            View Listings
          </Link>
        </div>
      </div>

      <div className="d-grid">
        <Link
          href={`/agent-single/${contact.id}`}
          className="ud-btn btn-white2"
        >
          Contact Agent
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </>
  );
};

export default ContactWithAgent;
