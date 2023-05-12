const mongoose = require("mongoose")
const loginSchema = new mongoose.Schema({
    uname: String,
    pw : String,
    email:String,
})

var loginModel = mongoose.model("loginmodels",loginSchema)

module.exports = {
    loginModel : loginModel
}