const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = 10;
const mongodb = require("mongodb");

const dotenv = require("dotenv");
dotenv.config();

var multer = require("multer");
const fs = require("fs");

const jwt = require("jsonwebtoken");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
var cookieParser = require("cookie-parser");
app.use(cookieParser());

const { conn } = require("./db/db");
const path = require("path");

const nodemailer = require('nodemailer')


const { join } = require("path");

const port = process.env.PORT;

const { msgModel } = require("./model/msgModel");
const { loginModel } = require("./model/loginModel");
const { fileinfoModel } = require("./model/fileinfoModel");
const { KeyPairModel } = require("./model/keyPairModel");


app.get("/", (req, res) => {
  res.sendFile(__dirname + join("/public/index.html"));
});

app.get("/home", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/home.html"));
});

function authenticateToken(req, res, next) {
  const token = req.cookies.secret;

  if (token == null) return res.sendStatus(401);
  let logged_user;

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    logged_user = user;
    if (err) return res.sendStatus(403);
    if (req.cookies.uname === logged_user.uname) {
      next();
    } else return res.sendStatus(403);
  });
}

app.post("/logout", (req, res) => {
  res.clearCookie("secret").clearCookie("uname");
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + join("/public/register.html"));
});

app.get("/msg", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/msg.html"));
});

app.get("/upload", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/upload.html"));
});

app.post("/register", async (req, res) => {
  var uname = req.body.uname;
  var pw = req.body.pw;
  var email = req.body.email;
  const hashedPw = await bcrypt.hash(pw, salt);

  loginModel.findOne({ $or: [{ uname: uname }, { email: email }] }, async (err, result) => {
    if (err) throw err;
    if (result) res.json({"error": 1});
    else {
      let newDoc = new loginModel({
        uname: uname,
        pw: hashedPw,
        email:email
      }).save();
      // const privateKey = await eccrypto.generatePrivate();
      // const publicKey = eccrypto.getPublic(privateKey);

      // const keys = {publicKey,privateKey};
      
      // let newKeys = new KeyPairModel({
      //   username: uname,
      //   publicKey : Buffer.from(keys.publicKey),
      //   privateKey : Buffer.from(keys.privateKey)
      // }).save().then(()=>{
      //   // res.redirect("/");
      //   res.json({"isok":1});
      // }).catch((error)=>{
      //   console.log(error);
      // })

        res.json({"error":0});


    }
  });
});
app.post("/save_publickey",async(req,res)=>{
  var uname = req.body.uname;
  var publicKey = req.body.publicKey;
  // console.log(uname);
  // const prevPublicKey = await KeyPairModel.remove({uname:uname});
  let newPublicKey  = new KeyPairModel({
    username: uname,
    publicKey:publicKey
  }).save().then(()=>{
    res.json({"error":0});
  }).catch(()=>{
    res.json({"error":1});
  })


})

app.post("/get_publickey",async (req,res)=>{
  var uname = req.body.recUname;
  // console.log(req.body)
  
  if(!uname){
    res.json({"error":1});
  }

  var result = await KeyPairModel.findOne({username:uname},{publicKey:1,_id:0});

  if(result){
    res.json(result);
  }
})

app.post("/login", (req, res) => {
  // console.log(req.headers.authorization);
  var loginuname = req.body.loginuname;
  var loginpw = req.body.loginpw;

  loginModel.findOne({ uname: loginuname }, async (err, result) => {
    if (err) throw err;
    if (result && (await bcrypt.compare(loginpw, result.pw))) {
      const token = jwt.sign({ uname: loginuname }, process.env.TOKEN_SECRET, {
        expiresIn: "30m",
      });
      res
        .cookie("secret", token, {})
        .cookie("uname", loginuname, {})
        .redirect("/home");
      // console.log(token);
    } else {
      res.send("username password not matched");
    }
  });
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalExt = path.extname(file.originalname); // Get the original file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + originalExt); // Append the extension to the filename
  }
});


const upload = multer({ storage });

var smtpTransport = nodemailer.createTransport({
  transport: 'SMTP',
  pool: true,
    service: "gmail",
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
app.post("/upload", upload.single("file"), async (req, res) => {
// app.post("/upload", async (req, res) => {
  var recUname = req.body.recuname;
  // console.log(req.body);  
  var loggedUser = getLoggedUser(req.cookies.secret,req.body.uname);
  // console.log(loggedUser)
  const fileHashValue = req.body.fileHashValue;
  const fileLocation = req.file.path;
  const filename = path.basename(fileLocation);
  try {
    let new_fileinfo = await new fileinfoModel({
      upload_uname: req.cookies.uname,
      name: filename,
      time: Date.now(),
      recUname: recUname,
      fileHashValue: fileHashValue,
      fileLocation : fileLocation
    }).save();
    // console.log("1111",req.file)

    let newDoc = new msgModel({
      msg: "http://localhost:3000/download/" + req.file.filename,//TODO: change url while hosting 
      to: recUname,
      from: loggedUser.uname,
      time: Date.now(),
    }).save();

    const recEmail = await loginModel.findOne({uname:recUname},{email:1});

    
    var mailOptions = {
        from: process.env.EMAIL,
        to: recEmail.email, 
        subject: `|DE PROJECT| ${loggedUser.uname} UPLOADED FILE FOR YOU`,
        text: `CHECK YOUR ACCOUNT ,  ${loggedUser.uname} UPLOADED FILE FOR YOU`
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            // res.redirect('/');
            res.json({ file: req.file });
        }
    });

    // res.json({ file: req.file });
  } catch (error) {
    console.log(error);
  }
});

app.get("/download/hash/:id",authenticateToken,async (req,res)=>{
  try {
    const filename = req.params.id;
    const resFileHashValue = await fileinfoModel.findOne({name:filename},{fileHashValue:1});
    if(resFileHashValue){
      res.json({fileHashValue : resFileHashValue.fileHashValue});
    }
  } catch (error) {
    console.log(error);
  }
})

app.get("/download/:id", authenticateToken, async (req, res) => {
  const fileId = req.params.id;
  try {
    // Check if the user is authorized to download the file
    const fileInfo = await fileinfoModel.findOne({ name: fileId, recUname: req.cookies.uname });
    if (!fileInfo) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    // Get the full path to the file on the server's file system
    const fileLocation = path.resolve(fileInfo.fileLocation);

    // Send the file to the client for download
    res.sendFile(fileLocation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/msg", (req, res) => {
  const touname = req.body.touname;
  const fromuname = getLoggedUser(req.cookies.secret, req.cookies.uname).uname;
  const msg = req.body.msg;

  loginModel.findOne({ uname: touname }, (err, result) => {
    if (err) throw err;
    if (!result) res.send("Enter valid touname");
    else {
      loginModel.findOne({ uname: fromuname }, (err, result) => {
        if (err) throw err;
        if (!result) res.send("Enter valid fromuname");
        else {
          let newDoc = new msgModel({
            msg: msg,
            to: touname,
            from: fromuname,
            time: Date.now(),
          }).save();
          res.send("done");
        }
      });
    }
  });
});

app.post("/temp/get_keys",async(req,res)=>{
  // const keys = {"privateKey": {"type": "Buffer","data": [119,77,221,228,209,127,0,22,125,122,89,213,105,138,201,32,225,59,66,160,170,240,205,48,179,176,56,163,21,220,208,192]
  //   },
  //   "publicKey": {
  //     "type": "Buffer","data": [4,138,109,65,20,212,68,10,229,32,23,160,51,209,113,81,174,23,237,82,224,17,43,26,163,33,169,146,226,236,62,96,8,48,80,207,160,236,254,13,181,237,183,162,53,178,210,147,61,18,134,176,193,94,74,150,107,218,36,243,4,10,194,120,65]
  //   }
  // }
  var logged_user = getLoggedUser(req.cookies.secret, req.cookies.uname);

  const fetchedPublicKey = await KeyPairModel.findOne({username : logged_user.uname },{publicKey:1,_id:0});
  res.json(fetchedPublicKey);
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

function getLoggedUser(token, uname) {
  //parameters : cookies.secret and cookies.uname
  var logged_user;
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (uname !== user.uname) return null;
    logged_user = user;
  });
  return logged_user;
}

function authUserWithparams(req, res, next) {
  const token = req.cookies.secret;

  if (token == null) return res.sendStatus(401);
  let logged_user;

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    logged_user = user;
    if (err) return res.sendStatus(403);
    if (req.cookies.uname === logged_user.uname && req.params.id === logged_user.uname) {
      next();
    } else return res.sendStatus(403);
  });
}

app.get("/api/msg/:id", authUserWithparams, async (req, res) => {
  try {
    var data;
    var logged_user = getLoggedUser(req.cookies.secret, req.cookies.uname);
    await msgModel
      .find(
        { to: logged_user.uname },
        { msg: 1, from: 1, _id: 0 },
        (err, result) => {
          if (err) return res.sendStatus(403);
          data = result;
        }
      )
      .sort({ time: -1 })
      .clone(); //without clone it will give warning
      // console.log(data);
    res.json(data);
  } catch (error) {
    res.json({"error":1});
    console.log(error);
  }
});

app.get("/inbox", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/inbox.html"));
});
app.get("/download", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/download.html"));
});
app.get("/importkey", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/importkey.html"));
});


app.get("/", (req, res) => {
  res.redirect("/login");
});
app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log(`listing on port ${port}`);
});
