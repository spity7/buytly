"use client";

import { useEffect, useId, useRef } from "react";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  isConfirming = false,
  onClose,
  onConfirm,
}) => {
  const reactId = useId();
  const modalId = `confirm-dialog-${reactId.replace(/:/g, "")}`;
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl) {
      return undefined;
    }

    let modalInstance;
    let cancelled = false;

    const handleHidden = () => {
      onCloseRef.current?.();
    };

    modalEl.addEventListener("hidden.bs.modal", handleHidden);

    import("bootstrap")
      .then(({ Modal }) => {
        if (cancelled) {
          return;
        }

        modalInstance = Modal.getOrCreateInstance(modalEl, {
          backdrop: "static",
          keyboard: !isConfirming,
        });

        if (open) {
          modalInstance.show();
        } else {
          modalInstance.hide();
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      modalEl.removeEventListener("hidden.bs.modal", handleHidden);
    };
  }, [open, isConfirming]);

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <div
      className="modal fade confirm-dialog"
      id={modalId}
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby={`${modalId}-label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}-label`}>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              disabled={isConfirming}
            />
          </div>

          <div className="modal-body">
            <p className="text mb0">{message}</p>
          </div>

          <div className="modal-footer confirm-dialog__footer">
            <button
              type="button"
              className="ud-btn btn-white2"
              data-bs-dismiss="modal"
              disabled={isConfirming}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`ud-btn btn-white2 confirm-dialog__confirm${
                confirmVariant === "danger"
                  ? " confirm-dialog__confirm--danger"
                  : ""
              }`}
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Removing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
