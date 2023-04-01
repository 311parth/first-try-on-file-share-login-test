
const mongoose = require("mongoose")

const fileinfoSchema = new mongoose.Schema({
    upload_uname : String,
    name : String,
    time : Date,
    recUname: String
  })
var fileinfoModel = mongoose.model("fileinfomodels",fileinfoSchema)
  
module.exports= {
    fileinfoModel : fileinfoModel
}