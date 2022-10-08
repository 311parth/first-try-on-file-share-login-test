const express = require("express")
const app = express()

const bcrypt = require('bcrypt');
const salt= 10

const bodyParser = require("body-parser")

var MongoClient = require('mongodb').MongoClient;
var mongodb = require("mongodb")
var url = "mongodb://localhost:27017/";
const fs = require("fs")

// const upload = multer({dest:'upload/'})

var multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
// const conn = mongoose.createConnection(url)
const conn = mongoose.createConnection("mongodb://localhost:27017/testdb")


var gfs;

conn.once('open',()=>{
    gfs =Grid(conn.db,mongoose.mongo)
    gfs.collection("filedb")
})



app.use(bodyParser.urlencoded({extended : true }))

app.get("/",(req,res)=>{

    res.sendFile(__dirname + "/index.html")    
})

app.post("/", (req, res) => {
  var uname = req.body.uname;
  var pw = req.body.pw;

  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    console.log("Database connected!");
    var testdb = db.db("testdb");

    var logindb = testdb.collection("logindb");
    const hashedPw = await bcrypt.hash(pw, salt);
    logindb.findOne({ uname: uname }, (err, result) => {
      if (err) throw err;
      if (result) res.send("enter unique username ");
      else {
        logindb.insertOne({ uname: uname, pw: hashedPw });
        res.send("done");
      }
    });
  });
});

app.post("/login",(req,res)=>{
    var loginuname = req.body.loginuname;
    var loginpw = req.body.loginpw;

    MongoClient.connect(url,async function(err, db) {
        if (err) throw err;
        console.log("Database connected!");
        var testdb = db.db("testdb")    
        
        var logindb = testdb.collection("logindb")
        
        logindb.findOne({uname : loginuname},async(err,result)=>{
            if(err) throw err;
            if(result && await bcrypt.compare(loginpw,result.pw))
            {
                res.send("login succesfully")
            }
            else{
                res.send("username password not matched")
            }
        })
      
      
      });
      
})


var storage = new GridFsStorage({
    url: "mongodb://localhost:27017/testdb",
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'filedb'
          };
          resolve(fileInfo);
        });
      });
    }
  });
const upload = multer({ storage });

app.post("/upload",upload.single("file"),(req,res)=>{
    res.json({file : req.file})
})



app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
  
      // Files exist
      return res.json(files);
    });
  });

app.get('/files/:id', (req, res) => {
    

    var fileOut =   conn.collection("filedb.files").find({ filename : req.params.id });
    // console.log(fileOut)
    fileOut.toArray(function (err,file){
        if (!file || file.length === 0) {
            return res.status(404).json({
              err: 'No file exists'
            });
          }
          // File exists
         
        console.log(file[0]._id)
        return res.json(file);
    })


});


app.get("/download/:id",(req,res)=>{
  const bucket = new mongodb.GridFSBucket(conn.db,{bucketName : "filedb"});

  bucket.openDownloadStreamByName(req.params.id).pipe(
    fs.createWriteStream(req.params.id).on("close", () => {
      res.download(__dirname + "/" + req.params.id);
      fs.rm(req.params.id,()=>{
        console.log("file removed")
      })
    })
  );

})



app.listen(3000,()=>{
    console.log("running on port 3000")
})