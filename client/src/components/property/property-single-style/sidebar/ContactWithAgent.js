"use client";

import ListingContactCard from "@/components/property/property-single-style/sidebar/ListingContactCard";
import {
  buildListingContactWhatsAppMessage,
  getListingContact,
  getListingContactCta,
  getListingContactHint,
  getListingContactViewerMode,
  getListingContactWhatsAppContext,
} from "@/lib/properties/listingContact";
import { useAuthSafe } from "@/providers/AuthProvider";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const ContactWithAgent = () => {
  const { property, isLoading } = usePropertySingle();
  const auth = useAuthSafe();
  const contact = getListingContact(property);
  const listingContext = getListingContactWhatsAppContext(property);
  const whatsappMessage = buildListingContactWhatsAppMessage(listingContext);
  const viewerMode = getListingContactViewerMode(property, auth?.user, contact);
  const cta = getListingContactCta(contact, viewerMode, { listingContext });
  const hint = getListingContactHint(viewerMode);

  return (
    <ListingContactCard
      contact={contact}
      viewerMode={viewerMode}
      cta={cta}
      hint={hint}
      whatsappMessage={whatsappMessage}
      isLoading={isLoading}
    />
  );
};

export default ContactWithAgent;
