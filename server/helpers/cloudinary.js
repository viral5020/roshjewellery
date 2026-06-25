const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "ddq6whtyl",
  api_key: "534477696332345",
  api_secret: "RSyS_1PbF7-HVArGL0xdWornUIw",
});

const storage = multer.memoryStorage();  // Store files in memory for processing

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",  // Automatically detect the resource type
  });
  return result;  // Return the result which contains the secure_url
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
