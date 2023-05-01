const fs = require('fs');
const eccrypto = require('eccrypto');

const args = process.argv.slice(2);
const inputFilePath = args[0];
const outputFilePath = args[1];

const privateKey = eccrypto.generatePrivate();
const publicKey = eccrypto.getPublic(privateKey);

const reader = fs.createReadStream(inputFilePath);
const writer = fs.createWriteStream(outputFilePath);

reader.on('data', function(chunk) {
  eccrypto.encrypt(publicKey, Buffer.from(chunk)).then(function(encrypted) {
    // eccrypto.decrypt(privateKey, encrypted).then(function(plaintext) {
    //   writer.write(Buffer.from(plaintext));
    // });
    writer.write(encrypted.ciphertext);
  });
});

reader.on('end', function() {
  writer.end();
});
