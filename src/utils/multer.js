const multer = require("multer");
const path = require("path");

const DATAURIParser = require("datauri/parser");

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("image");
const multerUploadsMultiple = multer({ storage }).array("images", 4);

const parser = new DATAURIParser();

const dataUri = (req) =>
  parser.format(path.extname(req.file.originalname).toString(), req.file.buffer)
    .content;

const dataUriMultiple = (files, x) =>
  parser.format(path.extname(files[x].originalname).toString(), files[x].buffer)
    .content;

module.exports = {
  multerUploads,
  dataUri,
  multerUploadsMultiple,
  dataUriMultiple,
};
