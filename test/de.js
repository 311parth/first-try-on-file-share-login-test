const fs = require('fs');
const eccrypto = require('eccrypto');

const keyData = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));

const privateKeyB = Buffer.from(keyData.privateKey, 'hex');
const publicKeyB = Buffer.from(keyData.publicKey, 'hex');
console.log(privateKeyB.length,publicKeyB.length);
const reader = fs.createReadStream('./encrypted.bin');

const writer = fs.createWriteStream('./decrypted.jpg');
reader.on('data', function (chunk) {
    const iv = chunk.slice(0, 16);
    const ciphertext = chunk.slice(16);
    eccrypto.decrypt(privateKeyB, { iv: iv, ciphertext: ciphertext }).then(function (plaintext) {
        writer.write(Buffer.from(plaintext));
    });

});
reader.on('end', function () {
    writer.end();
    console.log('Decryption complete.');
});
