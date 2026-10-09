/**
 * Form messages of the live block-57.com forms (Contact Form 7 defaults,
 * phase0/spec/copy-deck.md#inquire.form, #contact.form, #home.schedule-popup).
 * Shared by every Block 57 form (inquire, contact, schedule a tour).
 *
 * `sent` was not observed on live (nothing was submitted during the capture);
 * it is the CF7 default, kept pending confirmation (OQ-42). `sending` is a
 * derived, screen-reader-only status.
 */
export const FORM_MESSAGES = {
  required: "Please fill out this field.",
  email: "Please enter an email address.",
  tel: "Please enter a telephone number.",
  tooLong: "This field has a too long input.",
  date: "Please enter a date in YYYY-MM-DD format.",
  dateTooEarly: "This field has a too early date.",
  invalidOption: "Undefined value was submitted through this field.",
  validationError:
    "One or more fields have an error. Please check and try again.",
  failed:
    "There was an error trying to send your message. Please try again later.",
  sent: "Thank you for your message. It has been sent.",
  sending: "Sending…",
};
