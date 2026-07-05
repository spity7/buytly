"use client";
import ModalVideo from "@/components/common/ModalVideo";
import { useState } from "react";

const VideoBox = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId="7EHnQ0VM4KY" />
      <button
        style={{ border: "none", background: "transparent" }}
        className="popup-iframe popup-youtube bounce-y d-flex align-items-center justify-content-start justify-content-xl-center fz14 fw600 ff-heading"
      >
        Watch Video{" "}
        <span
          className="video-icon flaticon-play fz12 ml20"
          role="button"
          onClick={() => setOpen(true)}
        ></span>
      </button>
    </>
  );
};

export default VideoBox;
