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

var cookieParser = require("cookie-parser");
app.use(cookieParser());

const { conn } = require("./db/db");
const crypto = require("crypto");
const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");

const { join } = require("path");

const port = process.env.PORT;

const { msgModel } = require("./model/msgModel");
const { loginModel } = require("./model/loginModel");
const { fileinfoModel } = require("./model/fileinfoModel");

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
  const hashedPw = await bcrypt.hash(pw, salt);

  loginModel.findOne({ uname: uname }, (err, result) => {
    if (err) throw err;
    if (result) res.send("enter unique username");
    else {
      let newDoc = new loginModel({
        uname: uname,
        pw: hashedPw,
      }).save();
      res.send("done");
    }
  });
});

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

var filename;
var storage = new GridFsStorage({
  url: "mongodb://localhost:27017/testdb",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "filedb",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
// app.post("/upload", async (req, res) => {

  var recUname = req.body.recuname;
  console.log(req.body);  
  try {
    let new_fileinfo = await new fileinfoModel({
      upload_uname: req.cookies.uname,
      name: filename,
      time: Date.now(),
      recUname: recUname,
    }).save();
    res.json({ file: req.file });
  } catch (error) {
    console.log(error);
  }
});

app.get("/download/:id", authenticateToken, async (req, res) => {
  const bucket = new mongodb.GridFSBucket(conn.db, { bucketName: "filedb" });
  await fileinfoModel
    .findOne(
      { name: req.params.id, recUname: req.cookies.uname },
      (err, result) => {
        if (err) throw err;
        if (result) {
          bucket.openDownloadStreamByName(req.params.id).pipe(
            fs.createWriteStream(req.params.id).on("close", () => {
              res.download(__dirname + "/" + req.params.id);
              fs.rm(req.params.id, () => {
                // console.log("file removed");
              });
            })
          );
        } else res.sendStatus(403);
      }
    )
    .clone()
    .catch((error) => {
      console.log(error);
    });
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
    //reason for adding clone  => https://stackoverflow.com/questions/68945315/mongooseerror-query-was-already-executed
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/inbox", authenticateToken, (req, res) => {
  res.sendFile(__dirname + join("/public/inbox.html"));
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`listing on port ${port}`);
});
