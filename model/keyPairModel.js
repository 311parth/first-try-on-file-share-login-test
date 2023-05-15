const mongoose = require("mongoose");

const keyPairSchema = new mongoose.Schema({
  username: String,
//   privateKey: {
//     type: Buffer,
//     required: true,
//   },
//   publicKey: {
//     type: Buffer,
//     required: true,
//   },
    publicKey:String
});


const KeyPairModel = mongoose.model("KeyPair", keyPairSchema);

module.exports = {
    KeyPairModel : KeyPairModel
}