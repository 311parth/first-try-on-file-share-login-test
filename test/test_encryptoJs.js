const fs = require('fs');
const eccrypto = require('eccrypto');

// Read the private key and public key from files
const keyData = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));
const privateKey = Buffer.from(keyData.privateKey, 'hex');
const publicKey = Buffer.from(keyData.publicKey, 'hex');

// Encrypt a file
const reader = fs.createReadStream('./file.txt');
const writer = fs.createWriteStream('./encrypted.bin');
eccrypto.encrypt(publicKey, reader).then(function (encrypted) {
    const iv = encrypted.iv;
    const ciphertext = encrypted.ciphertext;
    writer.write(iv);
    writer.write(ciphertext);
    writer.end();
    console.log('Encryption complete.');
});

// Decrypt a file
const reader2 = fs.createReadStream('./encrypted.bin');
const writer2 = fs.createWriteStream('./file_decrypted.txt');
reader2.on('data', function (chunk) {
    const iv = chunk.slice(0, 16);
    const ciphertext = chunk.slice(16);
    eccrypto.decrypt(privateKey, { iv: iv, ciphertext: ciphertext }).then(function (plaintext) {
        writer2.write(Buffer.from(plaintext));
    });
});
reader2.on('end', function () {
    writer2.end();
    console.log('Decryption complete.');
});
