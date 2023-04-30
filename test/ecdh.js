const { Buffer } = require("buffer");
var eccrypto = require("eccrypto");

function hello(params) {
    console.log("he");
}
var privateKeyA = eccrypto.generatePrivate();
var publicKeyA = eccrypto.getPublic(privateKeyA);
var privateKeyB = eccrypto.generatePrivate();
var publicKeyB = eccrypto.getPublic(privateKeyB);
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
var reader = fs.createReadStream("./bernard-hermant-hQ3WZnY3yZ0-unsplash.jpg");
reader.on('data', function (chunk) {
    eccrypto.encrypt(publicKeyB, Buffer.from(chunk)).then(function(encrypted) {
        eccrypto.decrypt(privateKeyB, encrypted).then(function(plaintext) {
        let writer = fs.createWriteStream('decrypted.jpg',{
            flags:"a"
        }) // Write the decrypted data to a new JPEG file
        writer.write(Buffer.from(plaintext));
        writer.end();
        });
      });   
});


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
