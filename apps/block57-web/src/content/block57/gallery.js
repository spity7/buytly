// /gallery/ content: the two live tabs and their images, in live order
// (DESIGN_SPEC §4.6.2). Live alt text and lightbox titles are raw file names
// (OQ-07), so each image has a written description instead (client to
// confirm). `id` is an asset id from "@/lib/block57/assets".

export const GALLERY_PAGE = {
  title: "Gallery",
  path: "/gallery/",
  metaDescription:
    "Exterior and interior renders of Block 57 in Cantonments, Accra: the buildings, the rooftop terraces and the residences.",
  ogImage: "img-037",
  /** Accessible name of the tabs section (derived). */
  label: "Photo gallery",
};

export const GALLERY_TABS = [
  {
    slug: "exterior",
    label: "Exterior",
    images: [
      {
        id: "img-037",
        alt: "Aerial view of Block 57 with its glass-walled rooftop pool and planted terraces",
      },
      {
        id: "img-036",
        alt: "Street view of a Block 57 façade with vertical fins and recessed balconies",
      },
      {
        id: "img-031",
        alt: "Rooftop lounge terrace with sofas, dining tables and planters seen from above",
      },
      {
        id: "img-032",
        alt: "Rooftop terrace with a timber deck, lounge sofas and landscaped planters",
      },
      {
        id: "img-040",
        alt: "Aerial view of the Block 57 compound and its rooftop terraces from the street corner",
      },
      {
        id: "img-023",
        alt: "Block 57 seen from the street behind its slatted boundary wall",
      },
      {
        id: "img-041",
        alt: "Street corner of Block 57 with cantilevered terraces, palms and the entrance",
      },
      {
        id: "img-042",
        alt: "Entrance steps and canopy of a Block 57 building framed by palms",
      },
      {
        id: "img-035",
        alt: "Landscaped walkway with palms and planters between the Block 57 buildings",
      },
    ],
  },
  {
    slug: "interior",
    label: "Interior",
    images: [
      {
        id: "img-004",
        alt: "Open-plan living room with a wall-mounted TV, lit display shelves and a breakfast bar",
      },
      {
        id: "img-033",
        alt: "Bedroom with an upholstered bed, a curved sofa and sheer curtains",
      },
      {
        id: "img-005",
        alt: "Living area with timber wall panels, an open kitchen and a sculpted coffee table",
      },
      {
        id: "img-043",
        alt: "Kitchen with timber cabinetry and a dining table with red chairs",
      },
      {
        id: "img-044",
        alt: "Bedroom with a padded headboard, pendant lights and a bouclé armchair",
      },
      {
        id: "img-045",
        alt: "Timber kitchen wall with built-in ovens and a lit niche",
      },
      {
        id: "img-047",
        alt: "Open-plan studio with a white kitchen, a breakfast bar and a TV wall",
      },
      {
        id: "img-050",
        alt: "Living area with a TV wall, lit shelving and timber side tables",
      },
      {
        id: "img-051",
        alt: "Bathroom with a walk-in shower and a stone vanity over timber storage",
      },
      {
        id: "img-052",
        alt: "Bedroom with a built-in timber wardrobe and lit open shelving",
      },
      {
        id: "img-060",
        alt: "Stone bathroom vanity with open shelves of folded towels",
      },
      {
        id: "img-065",
        alt: "Bed with a padded headboard against timber panelling, with pendant lights",
      },
      {
        id: "img-008",
        alt: "Living room with a timber TV wall, built-in shelving and curved sofas",
      },
      {
        id: "img-068",
        alt: "Double-height living room opening onto the dining area and kitchen",
      },
      {
        id: "img-064",
        alt: "Bedroom with a TV wall, a dressing table and sheer curtains",
      },
      {
        id: "img-069",
        alt: "Studio living area with a curved sofa, a white kitchen and a breakfast bar",
      },
    ],
  },
];
