"use client";
import ModalVideo from "@/components/common/ModalVideo";
import { useState } from "react";

const VideoBox = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId="y9j-BL5ocW8" />
      <div className="img-box-9 d-flex justify-content-center align-items-center">
        <button
          className="popup-iframe popup-youtube"
          role="button"
          onClick={() => setOpen(true)}
        >
          <i className="fas fa-circle-play mr15" />
        </button>
        <h6 className="fz14 mb-0">Watch Video</h6>
      </div>
    </>
  );
};

export default VideoBox;
