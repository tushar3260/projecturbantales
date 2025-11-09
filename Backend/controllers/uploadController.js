// controllers/uploadController.js
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (req, res) => {
  try {
    // Expecting express-fileupload middleware -> req.files.file
    const file = req.files?.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // For express-fileupload with useTempFiles: true -> file.tempFilePath exists
    const tempPath = file.tempFilePath || file.path || null;
    const usePath = tempPath || file.data; // fallback

    const opts = {
      folder: "urbantales_uploads",
      resource_type: "auto", // auto detect image/video
    };

    const result = await cloudinary.uploader.upload(usePath, opts);

    // remove temp file if exists
    if (tempPath && fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (e) { console.warn("Failed to remove temp file", e); }
    }

    return res.json({ url: result.secure_url, raw: result });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
