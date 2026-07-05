"use client";
import ModalVideo from "@/components/common/ModalVideo";
import React, { useState } from "react";

const PropertyVideo = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId="7EHnQ0VM4KY" />
      <div className="col-md-12">
        <div className="property_video bdrs12 w-100">
          <button
            className="video_popup_btn mx-auto popup-img"
            onClick={() => setOpen(true)}
            style={{ border: "none", background: "transparent" }}
          >
            <span className="flaticon-play" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PropertyVideo;
