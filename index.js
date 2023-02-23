const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary with your account credentials
cloudinary.config({
  cloud_name: process.env.CLOUND_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Create a new Cloudinary storage object for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sample",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Error loading file!", false);
  }
};

// Create a new Multer instance with the Cloudinary storage object
const upload = multer({ storage: storage, fileFilter: multerFilter });

// Create a new Express app
const app = express();

// Define a route to handle image uploads
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // Get the uploaded file data from the request
    const file = req.file;
    console.log(req.file);

    // Use Sharp to resize and compress the image
    console.log(file.path);
    // const resizedImage = await sharp(req.file.buffer)
    //   .resize({ width: 300 })
    //   .jpeg({ quality: 80 })
    //   .toBuffer();
    // console.log(resizedImage);

    // res.send("Hello");

    // Upload the processed image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(file.path, {
      public_id: file.originalname.split(".")[0],
      folder: "sample",
      overwrite: true,
    });
    console.log(uploadedImage);

    // Return the Cloudinary URL of the processed image
    res.json({ url: uploadedImage.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
