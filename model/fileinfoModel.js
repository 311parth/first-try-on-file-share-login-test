const mongoose = require("mongoose");

const fileinfoSchema = new mongoose.Schema({
  upload_uname: String,
  name: String,
  time: Date,
  recUname: String,
  fileHashValue: String,
  fileLocation: String, // New field to store the file location (local path)
});

var fileinfoModel = mongoose.model("fileinfomodels", fileinfoSchema);

module.exports = {
  fileinfoModel: fileinfoModel,
};
