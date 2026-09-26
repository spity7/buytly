"use client";

import {
  getListingContact,
  getListingContactCta,
  getListingContactHint,
  getListingContactViewerMode,
} from "@/lib/properties/listingContact";
import { remoteImageProps } from "@/lib/images/remoteImage";
import { useAuthSafe } from "@/providers/AuthProvider";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import Image from "next/image";
import Link from "next/link";

const AVATAR_SIZE = 72;

const ContactWithAgent = () => {
  const { property, isLoading } = usePropertySingle();
  const auth = useAuthSafe();
  const contact = getListingContact(property);
  const viewerMode = getListingContactViewerMode(property, auth?.user, contact);
  const cta = getListingContactCta(contact, viewerMode);
  const hint = getListingContactHint(viewerMode);
  const showPhoneMeta = contact?.phone && !cta?.href?.startsWith("tel:");
  const showEmailMeta =
    contact?.email && !contact?.phone && !cta?.href?.startsWith("mailto:");

  if (isLoading) {
    return (
      <div
        className="listing-contact"
        aria-busy="true"
        aria-label="Loading listing contact"
      >
        <div className="listing-contact__row">
          <div className="listing-contact__avatar listing-contact__avatar--placeholder" />
          <div className="listing-contact__details">
            <div className="listing-contact__skeleton listing-contact__skeleton--title" />
            <div className="listing-contact__skeleton listing-contact__skeleton--line" />
          </div>
        </div>
        <div className="listing-contact__skeleton listing-contact__skeleton--button" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="listing-contact">
        <p className="listing-contact__empty mb-0">
          Listing contact details are not available for this property.
        </p>
      </div>
    );
  }

  const imageProps = remoteImageProps(contact.avatarUrl);

  return (
    <div className="listing-contact">
      {hint ? <p className="listing-contact__hint mb-0">{hint}</p> : null}

      <div className="listing-contact__row">
        <div className="listing-contact__avatar">
          <Image
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            src={contact.avatarUrl}
            alt={contact.name}
            className="listing-contact__avatar-img"
            unoptimized={contact.avatarUnoptimized || imageProps.unoptimized}
          />
        </div>

        <div className="listing-contact__details">
          <p className="listing-contact__name">{contact.name}</p>
          <p className="listing-contact__role">{contact.roleLabel}</p>

          {showPhoneMeta ? (
            <a className="listing-contact__meta" href={`tel:${contact.phone}`}>
              <i className="flaticon-call" aria-hidden="true" />
              <span>{contact.phone}</span>
            </a>
          ) : null}

          {showEmailMeta ? (
            <a
              className="listing-contact__meta"
              href={`mailto:${contact.email}`}
            >
              <i className="flaticon-email" aria-hidden="true" />
              <span>{contact.email}</span>
            </a>
          ) : null}

          {contact.profileHref ? (
            <Link href={contact.profileHref} className="listing-contact__link">
              View listings
            </Link>
          ) : null}
        </div>
      </div>

      {cta ? (
        <div className="listing-contact__actions">
          {cta.href.startsWith("/") ? (
            <Link href={cta.href} className="ud-btn btn-white2 w-100">
              {cta.label}
              <i className="fal fa-arrow-right-long" aria-hidden="true" />
            </Link>
          ) : (
            <a href={cta.href} className="ud-btn btn-white2 w-100">
              {cta.label}
              <i className="fal fa-arrow-right-long" aria-hidden="true" />
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ContactWithAgent;
