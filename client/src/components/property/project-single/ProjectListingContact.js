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
import { useProjectSingle } from "@/providers/ProjectSingleProvider";

export default function ProjectListingContact() {
  const { project, isLoading } = useProjectSingle();
  const auth = useAuthSafe();
  const contact = getListingContact(project);
  const listingContext = getListingContactWhatsAppContext(project);
  const whatsappMessage = buildListingContactWhatsAppMessage(listingContext);
  const viewerMode = getListingContactViewerMode(project, auth?.user, contact, {
    manageEditBase: "/dashboard-edit-project",
  });
  const cta = getListingContactCta(contact, viewerMode, {
    selfManageLabel: "Edit project",
    listingContext,
  });
  const hint = getListingContactHint(viewerMode);

  return (
    <ListingContactCard
      contact={contact}
      viewerMode={viewerMode}
      cta={cta}
      hint={hint}
      whatsappMessage={whatsappMessage}
      isLoading={isLoading}
      emptyMessage="Project contact details are not available."
    />
  );
}
