const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (subfolder) => {
  const uploadDir = path.join(__dirname, "..", "..", "uploads", subfolder);
  ensureDir(uploadDir);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${safeName}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|stl|obj|zip/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.test(ext) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed: images (jpg, png, webp) or 3D files (stl, obj, zip)"), false);
  }
};

const productUpload = multer({
  storage: createStorage("products"),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter,
});

const userUpload = multer({
  storage: createStorage("users"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const orderUpload = multer({
  storage: createStorage("orders"),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB for 3D photos/models
  fileFilter,
});

module.exports = {
  productUpload,
  userUpload,
  orderUpload,
};

