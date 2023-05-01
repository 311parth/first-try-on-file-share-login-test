const fs = require('fs');
const eccrypto = require('eccrypto');

const keyData = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));

const privateKeyB = Buffer.from(keyData.privateKey, 'hex');
const publicKeyB = Buffer.from(keyData.publicKey, 'hex');

const reader = fs.createReadStream('./p6-2.png');
const writer = fs.createWriteStream('./encrypted.bin');
reader.on('data', function (chunk) {
    eccrypto.encrypt(publicKeyB, chunk).then(function (encrypted) {
        const iv = encrypted.iv;
        const ciphertext = encrypted.ciphertext;
        writer.write(Buffer.concat([iv, ciphertext]));
    });
});


reader.on('end', function () {
    writer.end();
    console.log('Encryption complete.');
});
