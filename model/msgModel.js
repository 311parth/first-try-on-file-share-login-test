
const mongoose = require("mongoose")


const msgSchema = new mongoose.Schema({
    to: String,
    from : String,
    msg : String,
    time : Date
  })
  
  
  var msgModel = mongoose.model("msgmodels",msgSchema)
  

  module.exports = {
      msgModel : msgModel
  }