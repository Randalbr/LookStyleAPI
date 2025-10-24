import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lookstyle",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "auto",
  },
});

export const uploadCloud = multer({ storage });
