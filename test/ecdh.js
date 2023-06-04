const { Buffer } = require("buffer");
var eccrypto = require("eccrypto");
var crypto = require("crypto");
function hello(params) {
    console.log("he");
}
// var privateKeyA = eccrypto.generatePrivate();
// var publicKeyA = eccrypto.getPublic(privateKeyA);
// var privateKeyB = eccrypto.generatePrivate();
// var publicKeyB = eccrypto.getPublic(privateKeyB);
// console.log(publicKeyA);
// eccrypto.derive(privateKeyA, publicKeyB).then(function(sharedKey1) {
//   eccrypto.derive(privateKeyB, publicKeyA).then(function(sharedKey2) {
//     console.log("Both shared keys are equal:", sharedKey1, sharedKey2);
//   });
// });
var fs = require("fs");

// fs.readFile("./bernard-hermant-hQ3WZnY3yZ0-unsplash.jpg","utf8",(err,data)=>{

//     console.log(data)
//     eccrypto.encrypt(publicKeyB, Buffer.from(data)).then(function(encrypted) {
//         // B decrypting the message.
//         console.log(encrypted.ciphertext);
//         eccrypto.decrypt(privateKeyB, encrypted).then(function(plaintext) {
//         //   console.log("Message to part B:", plaintext.toString());
//             let writer = fs.createWriteStream('test.jpg') 
//             writer.write(plaintext);
//         });
//       });
// })
// var reader = fs.createReadStream("./bernard-hermant-hQ3WZnY3yZ0-unsplash.jpg");

// //working code 
// var reader = fs.createReadStream("./p6-2.png");

// reader.on('data', function (chunk) {
//     console.log(privateKeyB,publicKeyB);
//     eccrypto.encrypt(publicKeyB, Buffer.from(chunk)).then(function(encrypted) {
    
//         eccrypto.decrypt(privateKeyB, encrypted).then(function(plaintext) {
//         let writer = fs.createWriteStream('decrypted.jpg',{
//             flags:"a"
//         }) // Write the decrypted data to a new JPEG file
//         writer.write(Buffer.from(plaintext));
//         writer.end();
//         });
//       });   
// });
// // end


// var reader = fs.createReadStream("./bernard-hermant-hQ3WZnY3yZ0-unsplash.jpg");
// reader.on('data', function (chunk) {
//     importedAlgo.encrypt(key,Buffer.from(chunk)).then(function(encrypted) {//encryption method

//         //store encrypted file 
        
//         //TODO:

//         //decrypt file 
//         importedAlgo.decrypt(key, encrypted).then(function(plaintext) {
//         let writer = fs.createWriteStream('decrypted.jpg',{//chenge .jpg to .pdf or anything else according to input file
//             flags:"a"
//         }) // Write the decrypted data to a new JPEG file
//         writer.write(Buffer.from(plaintext));
//         writer.end();
//         });
//       })
// });

// var keyPath = "./keys.json"

// const privateKeyJson = JSON.parse(fs.readFileSync(keyPath)).privateKey;
// const privateKey = Buffer.from(privateKeyJson.data,'hex');
// const publicKeyJson = JSON.parse(fs.readFileSync(keyPath)).publicKey;
// const publicKey = Buffer.from(publicKeyJson.data);

// var reader = fs.createReadStream("./p6-2.png");

// reader.on('data', function (chunk) {
//     eccrypto.encrypt(publicKey, Buffer.from(chunk)).then(function(encrypted) {
    
//         // eccrypto.decrypt(privateKeyB, encrypted).then(function(plaintext) {
//         let writer = fs.createWriteStream('decrypted.jpg',{
//             flags:"a"
//         }) // Write the decrypted data to a new JPEG file
//         // writer.write(Buffer.from(plaintext));
//         writer.write(Buffer.from(JSON.stringify(encrypted)));
//         writer.end();
//         });
//     //   });   
// });

// var encrypted;

// const data = fs.readFileSync('./decrypted.jpg');
// console.log(data)
//         encrypted = JSON.parse(data);
//         console.log(encrypted)
//         eccrypto.decrypt(privateKey, encrypted).then(function(plaintext) {
//         let writer = fs.createWriteStream('de-decrypted.jpg',{
//             flags:"a"
//         }) // Write the decrypted data to a new JPEG file
//         writer.write(Buffer.from(plaintext));
//         writer.end();
//         });


//working too
// const keyPath = './keys.json';
// const keys = JSON.parse(fs.readFileSync(keyPath));

// const privateKey = Buffer.from(keys.privateKey.data, 'hex');
// const publicKey = Buffer.from(keys.publicKey.data);

// const reader = fs.createReadStream('./p6-2.png');

// const chunks = [];
// reader.on('data', chunk => chunks.push(chunk));
// reader.on('end', () => {
//   const data = Buffer.concat(chunks);

//   eccrypto.encrypt(publicKey, data).then(encrypted => {
//     fs.writeFileSync('./encrypted.json', JSON.stringify(encrypted));

//     eccrypto.decrypt(privateKey, encrypted).then(decrypted => {
//       fs.writeFileSync('./decrypted.jpg', decrypted);
//       console.log('Encryption and decryption done successfully!');
//     }).catch(err => console.error('Error decrypting:', err));
//   }).catch(err => console.error('Error encrypting:', err));
// });






const keyPath = './keys.json';
const keys = JSON.parse(fs.readFileSync(keyPath));

const privateKey = Buffer.from(keys.privateKey.data, 'hex');
const publicKey = Buffer.from(keys.publicKey.data,'hex');

function encryptFile(inputPath, outputPath) {
  const reader = fs.createReadStream(inputPath);
  const chunks = [];

  reader.on('data', chunk => chunks.push(chunk));

  reader.on('end', () => {
    const data = Buffer.concat(chunks);

    eccrypto.encrypt(publicKey, data)
      .then(encrypted => {
        fs.writeFileSync(outputPath, JSON.stringify(encrypted));
        console.log(`File ${inputPath} encrypted and saved to ${outputPath}`);
      })
      .catch(err => console.error('Error encrypting:', err));
  });
}

function decryptFile(inputPath, outputPath) {
  const encrypted = JSON.parse(fs.readFileSync(inputPath));
  console.log(encrypted);
//   eccrypto.decrypt(privateKey, encrypted)
eccrypto.decrypt(privateKey, {
    iv: Buffer.from(encrypted.iv, 'hex'),
    ephemPublicKey: Buffer.from(encrypted.ephemPublicKey, 'hex'),
    ciphertext: Buffer.from(encrypted.ciphertext, 'hex'),
    mac: Buffer.from(encrypted.mac, 'hex')
  })
    .then(decrypted => {
      fs.writeFileSync(outputPath, decrypted);
      console.log(`File ${inputPath} decrypted and saved to ${outputPath}`);
    })
    .catch(err => console.error('Error decrypting:', err));
}


// encryptFile("./p6-2.png","encrypted-p6-2.json");
// decryptFile("./encrypted-p6-2.json","decrypted-p6-2.png");

var str = "message to sign";
// Always hash you message to sign!
var msg = crypto.createHash("sha256").update(str).digest();
console.log(msg);
