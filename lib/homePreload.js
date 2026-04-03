export const FRAME_COUNT = 192;
export const FRAME_PAD_LENGTH = 5;

export const getFrameSrc = (index) =>
  `/frames/${String(index).padStart(FRAME_PAD_LENGTH, "0")}_compressed.webp`;

export const PHYSICS_TEXTURES = [
  "/nextjs.jpg",
  "/react.jpg",
  "/python.jpg",
  "/javascript.jpg",
  "/html.png",
  "/tailwind.jpg",
  "/nodejs.jpg",
  "/expressjs.jpg",
  "/mongodb.jpg",
];

export const PHYSICS_ENVIRONMENT = "/adamsbridge.hdr";
