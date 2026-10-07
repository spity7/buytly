"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BRAND_NAME } from "@/data/brandAssets";
import {
  formatInquiryName,
  formatInquiryReceived,
} from "@/components/property/dashboard/dashboard-admin-inquiries/inquiryFormat";

/**
 * Full text of one inquiry message (Bootstrap modal, same wiring as
 * ConfirmDialog). Open while `inquiry` is set; `onClose` runs once hidden.
 */
export default function InquiryMessageDialog({ inquiry, onClose }) {
  const reactId = useId();
  const modalId = `inquiry-message-${reactId.replace(/:/g, "")}`;
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const open = Boolean(inquiry);
  // Keep the last inquiry rendered while the modal fades out.
  const [shown, setShown] = useState(inquiry);
  if (inquiry && inquiry !== shown) {
    setShown(inquiry);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl) return undefined;

    let cancelled = false;
    const handleHidden = () => onCloseRef.current?.();
    modalEl.addEventListener("hidden.bs.modal", handleHidden);

    import("bootstrap")
      .then(({ Modal }) => {
        if (cancelled) return;
        const modal = Modal.getOrCreateInstance(modalEl);
        if (open) modal.show();
        else modal.hide();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      modalEl.removeEventListener("hidden.bs.modal", handleHidden);
    };
  }, [open]);

  const received = formatInquiryReceived(shown?.createdAt);
  const email = shown?.email;
  const replyHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Re: your ${BRAND_NAME} inquiry`)}`
    : null;

  return (
    <div
      className="modal fade inquiry-message-dialog"
      id={modalId}
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby={`${modalId}-label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title" id={`${modalId}-label`}>
                Message from {formatInquiryName(shown)}
              </h5>
              {received ? (
                <p className="text fz13 mb0">
                  Received {received.date} at {received.time}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            {shown?.residenceType || shown?.unitLabel ? (
              <p className="text fz14 mb15">
                {[shown.residenceType, shown.unitLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
            <p className="inquiry-message-dialog__message mb0">
              {shown?.message}
            </p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="ud-btn btn-white2"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            {replyHref ? (
              <a className="ud-btn btn-thm" href={replyHref}>
                Reply by email
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
