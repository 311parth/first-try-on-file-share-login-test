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

const jwt = require("jsonwebtoken")

app.use(bodyParser.urlencoded({extended : true }))

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const mongoose = require("mongoose")
const Grid  = require("gridfs-stream")
const { join } = require("path")

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
  msg : String,
  time : Date
})

var msgModel = mongoose.model("msgmodels",msgSchema)

const fileinfoSchema = new mongoose.Schema({
  upload_uname : String,
  name : String,
})

var fileinfoModel = mongoose.model("fileinfomodels",fileinfoSchema)


const conn = mongoose.createConnection(dburl)



app.get("/",(req,res)=>{
    res.sendFile(__dirname + join("/public/index.html"))
})


app.get("/home",isLogin,(req,res)=>{
  res.sendFile(__dirname + join("/public/home.html"))
})

function isLogin(req,res,next){
  // console.log(req.cookies.islogin)
  if(req.cookies.islogin)
    next()
  else
    res.send("Login first")
}

app.post("/logout",(req,res)=>{
  res.clearCookie("islogin");
  res.redirect("/")
})


app.get("/register",(req,res)=>{
  res.sendFile(__dirname + join("/public/register.html"))
})



app.get("/msg",(req,res)=>{
  res.sendFile(__dirname + join("/public/msg.html"))
})

app.get("/upload",isLogin,(req,res)=>{
  res.sendFile(__dirname + join("/public/upload.html"))
})



app.post("/register",async(req,res)=>{
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
  

  console.log(req.headers.authorization)
    var loginuname = req.body.loginuname;
    var loginpw = req.body.loginpw;

    loginModel.findOne({uname : loginuname},async (err,result)=>{
        if(err) throw err;
        if(result && await bcrypt.compare(loginpw,result.pw))
        {
            // msgModel.find({to:loginuname},async(err,result)=>{
            //   if(err) throw err;
            //   if(result)
            //     res.send(result);
            //   else  
            //     res.send("no msgs");
            // }).sort({time : -1})

            
            res.cookie("islogin" , true,{}).cookie("uname",loginuname,{}).redirect("/home")

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
var filename ;
var storage = new GridFsStorage({
    url: "mongodb://localhost:27017/testdb",
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
           filename = buf.toString('hex') + path.extname(file.originalname);
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

app.post("/upload",upload.single("file"),async(req,res)=>{
    console.log(req.body);
    
    let new_fileinfo = new fileinfoModel({
      upload_uname : req.cookies.uname,
      name : filename
     }).save();
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


app.post("/msg",(req,res)=>{
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
            from : fromuname,
            time : Date.now(),
          }).save();
          res.send("done")
        }
      })
    }
  });
  })

/*
//not needed now
app.get("/api/get_all_users",(req,res)=>{
  let all_users = []
  loginModel.find({},(err,result)=>{
    result.forEach(i => {
      all_users.push(i.uname)
    });
   res.send(all_users)
  })
});
*/





app.listen(port,()=>{
    console.log(`listing on port ${port}`)
})