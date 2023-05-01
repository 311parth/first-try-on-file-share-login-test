const fs = require('fs');
const eccrypto = require('eccrypto');

const privateKeyFilePath = './keys.json';

// Read private key from file
const privateKeyJson = JSON.parse(fs.readFileSync(privateKeyFilePath)).privateKey;
const privateKey = Buffer.from(privateKeyJson.data,'hex');

// Function to decrypt file with private key
function decryptFile(filePath, privateKey) {
  // Read encrypted file
  // const reader = fs.createReadStream(filePath);

  // reader.on('data', function (chunk) {
  //   // Decrypt file data
  //   eccrypto.decrypt(privateKey, {ciphertext: chunk}).then(function (plaintext) {
  //     // Write the decrypted data to a new file
  //     const writer = fs.createWriteStream(`${filePath}.decrypted`, {
  //       flags: 'a',
  //     });
  //     writer.write(Buffer.from(plaintext));
  //     writer.end();
  //   });
  // });

  // Read the encrypted data from the file
  // const encryptedData = JSON.parse(fs.readFileSync(filePath));

  // // Decrypt the data using the private key
  // eccrypto.decrypt(privateKey, encryptedData).then(decryptedData => {
  //   // Write the decrypted data to a new file
  //   fs.writeFileSync(`${filePath}.decrypted`, decryptedData);
  // }).catch(err => {
  //   console.error('Decryption error:', err);
  // });

  // const reader = fs.createReadStream(filePath);

  // reader.on('data', function (chunk) {
  //   // Decrypt file data
  //   eccrypto.decrypt(privateKey, { ciphertext: chunk }).then(function (plaintext) {
  //     // Write the decrypted data to a new file
  //     const writer = fs.createWriteStream(`${filePath}.decrypted`, {
  //       flags: 'a',
  //     });
  //     writer.write(Buffer.from(plaintext));
  //     writer.end();
  //   }).catch(function(error) {
  //     console.log(error);
  //   });
  // });

  const reader = fs.createReadStream(filePath);

  // Parse the encrypted data
  let encryptedData = '';
  reader.on('data', function (chunk) {
    encryptedData += chunk;
  });

  reader.on('end', function () {
    const encryptedJson = JSON.parse(encryptedData);
    const iv = Buffer.from(encryptedJson.iv, 'hex');
    const ephemPublicKey = Buffer.from(encryptedJson.ephemPublicKey, 'hex');
    const ciphertext = Buffer.from(encryptedJson.ciphertext, 'hex');
    const mac = Buffer.from(encryptedJson.mac, 'hex');

    // Decrypt file data
    eccrypto.decrypt(privateKey, {
      iv: iv,
      ephemPublicKey: ephemPublicKey,
      ciphertext: ciphertext,
      mac: mac,
    }).then(function (plaintext) {
      // Write the decrypted data to a new file
      const writer = fs.createWriteStream(`${filePath}.decrypted`, {
        flags: 'a',
      });
      writer.write(Buffer.from(plaintext));
      writer.end();
    });
  });
}

// Get file path from command line arguments
const filePath = process.argv[2];

// Decrypt file with private key
decryptFile(filePath, privateKey);
