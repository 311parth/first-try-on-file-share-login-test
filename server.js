const express = require("express")
const app = express()
const bodyParser=require("body-parser")
const bcrypt = require("bcrypt")
const salt = 10
const mongodb = require("mongodb")
const {GridFsStorage} = require('multer-gridfs-storage');

const dotenv =  require("dotenv")
dotenv.config()

var multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require("fs");

app.use(bodyParser.urlencoded({extended : true }))

const mongoose = require("mongoose")
const Grid  = require("gridfs-stream")

const dburl =  process.env.MONGODB_URL;
mongoose.connect(dburl)
const port = process.env.PORT;

const loginSchema = new mongoose.Schema({
    uname: String,
    pw : String
})

var loginModel = mongoose.model("loginmodels",loginSchema)


const msgSchema = new mongoose.Schema({
  to: String,
  from : String,
  msg : String
})

var msgModel = mongoose.model("msgmodels",msgSchema)

const conn = mongoose.createConnection(dburl)




app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

app.post("/",async(req,res)=>{
    var uname = req.body.uname;
    var pw = req.body.pw;
    const hashedPw = await bcrypt.hash(pw, salt);

    loginModel.findOne({uname: uname} , (err,result)=>{
        if(err) throw err;
        if(result)
            res.send("enter unique username");
        else
        {
            let newDoc = new loginModel({
                uname:uname,
                pw: hashedPw
            }).save();
            res.send("done")
        }
    })
})

app.post("/login",(req,res)=>{
    var loginuname = req.body.loginuname;
    var loginpw = req.body.loginpw;

    loginModel.findOne({uname : loginuname},async (err,result)=>{
        if(err) throw err;
        if(result && await bcrypt.compare(loginpw,result.pw))
        {
            msgModel.find({to:loginuname},async(err,result)=>{
              if(err) throw err;
              if(result)
                res.send(result);
              else  
                res.send("no msgs");
            })

            // res.send("login succesfully")
        }
        else{
            res.send("username password not matched")
        }
    })
})



var gfs;

conn.once('open',()=>{
    gfs =Grid(conn.db,mongoose.mongo)
    gfs.collection("filedb")

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


app.get("/download/:id", (req, res) => {
  const bucket = new mongodb.GridFSBucket(conn.db, { bucketName: "filedb" });

  bucket.openDownloadStreamByName(req.params.id).pipe(
    fs.createWriteStream(req.params.id).on("close", () => {
      res.download(__dirname + "/" + req.params.id);
      fs.rm(req.params.id, () => {
        console.log("file removed");
      });
    })
  );
});


app.post("/sendmsg",(req,res)=>{
  const touname = req.body.touname;
  const fromuname = req.body.fromuname;
  const msg = req.body.msg;


  loginModel.findOne({uname : touname},(err,result)=>{
    if(err) throw err;
    if(!result)
      res.send("Enter valid touname");
    else{
      loginModel.findOne({uname : fromuname},(err,result)=>{
        if(err) throw err;
        if(!result)
          res.send("Enter valid fromuname");
        else
        {
          let newDoc = new msgModel({
            msg : msg,
            to : touname,
            from : fromuname
          }).save();
          res.send("done")

        }
          
      })
    }
  });


})






app.listen(port,()=>{
    console.log(`listing on port ${port}`)
})