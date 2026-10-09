const joinName = (firstName, lastName) =>
  [firstName, lastName].filter(Boolean).join(" ");

/**
 * Names of a contact submission. Forms with a single name field send
 * `fullName`; it is split on the first whitespace only when neither
 * `firstName` nor `lastName` was sent. `fullName` is always derived when
 * missing, so the admin search and emails can use the whole name. Every part
 * may be empty (the Block 57 contact form has no name fields).
 */
export const resolveInquiryName = ({ firstName, lastName, fullName }) => {
  if (!firstName && !lastName && fullName) {
    const splitAt = fullName.search(/\s/);
    return splitAt === -1
      ? { firstName: fullName, lastName: "", fullName }
      : {
          firstName: fullName.slice(0, splitAt),
          lastName: fullName.slice(splitAt).trim(),
          fullName,
        };
  }

  return {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    fullName: fullName || joinName(firstName, lastName),
  };
};

/**
 * Admin response shape for a lean inquiry: fills the fields that inquiries
 * stored before they existed (fullName, topic, preferred date/time) lack.
 */
export const toInquiryResponse = (inquiry) => ({
  ...inquiry,
  fullName: inquiry.fullName || joinName(inquiry.firstName, inquiry.lastName),
  topic: inquiry.topic || "inquiry",
  preferredDate: inquiry.preferredDate ?? "",
  preferredTime: inquiry.preferredTime ?? "",
});
