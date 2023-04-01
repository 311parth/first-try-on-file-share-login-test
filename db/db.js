const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const dburl = process.env.MONGODB_URL;
mongoose.connect(dburl);

const conn = mongoose.createConnection(dburl);

var gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("filedb");
});

module.exports = {
  conn: conn,
};
