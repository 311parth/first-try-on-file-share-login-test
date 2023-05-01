const fs = require('fs');
const eccrypto = require('eccrypto');

const publicKeyFilePath = './keys.json';
const privateKeyFilePath = './keys.json';

// Read public key from file
// const publicKeyJson = JSON.parse(fs.readFileSync(publicKeyFilePath)).publicKey;
// const publicKey = Buffer.from(publicKeyJson.data);

// console.log(publicKeyJson)
const privateKeyJson = JSON.parse(fs.readFileSync(privateKeyFilePath)).privateKey;
var privateKey = Buffer.from(privateKeyJson.data);
console.log(privateKeyJson)
privateKey = Buffer.from(privateKey,'hex');
console.log(privateKey)

var publicKey = eccrypto.getPublic(privateKey)
// Function to encrypt file with public key

function encryptFile(filePath, publicKey) {
//   const privateKey = eccrypto.generatePrivate();

  // Read file
  // const reader = fs.createReadStream(filePath);

  // reader.on('data', function (chunk) {

  //   // Encrypt file data
  //   eccrypto.encrypt(publicKey, Buffer.from(chunk)).then(function (encrypted) {
  //     // Write the encrypted data to a new file
  //     const writer = fs.createWriteStream(`${filePath}.encrypted`, {
  //       flags: 'a',
  //     });
  //     writer.write(Buffer.from(encrypted.ciphertext));
  //     writer.end();
  //   });
  // });
  // Read the file data
  // const fileData = fs.readFileSync(filePath);

  // // Encrypt the file data using the public key
  // eccrypto.encrypt(publicKey, fileData).then(encryptedData => {
  //   // Write the encrypted data to a new file
  //   fs.writeFileSync(`${filePath}.encrypted`, JSON.stringify(encryptedData));
  // }).catch(err => {
  //   console.error('Encryption error:', err);
  // });


  // Read file
  const reader = fs.createReadStream(filePath);

  reader.on('data', function (chunk) {
    // Encrypt file data
    eccrypto.encrypt(publicKey, Buffer.from(chunk)).then(function (encrypted) {
      // Write the encrypted data to a new file
      console.log(encrypted);
      const writer = fs.createWriteStream(`${filePath}.encrypted`, {
        flags: 'a',
      });
      writer.write(Buffer.from(encrypted.ciphertext));
      writer.end();
    });
  });
}

// Get file path from command line arguments
const filePath = process.argv[2];

// Encrypt file with public key
encryptFile(filePath, publicKey);


