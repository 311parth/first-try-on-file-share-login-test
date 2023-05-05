const fs = require('fs');
const eccrypto = require('eccrypto');
const keyPath = './keys.json';
const keys = JSON.parse(fs.readFileSync(keyPath));

const privateKey = Buffer.from(keys.privateKey.data, 'hex');
const publicKey = Buffer.from(keys.publicKey.data,'hex');


async function encryptFile(inputBuffer,publicKey) {
    const encrypted = await eccrypto.encrypt(publicKey, inputBuffer);
    const encryptedJson = JSON.stringify(encrypted);
    return encryptedJson;
    // return Buffer.from(encryptedJson);
}

async function decryptFile(inputBuffer,privateKey) {
    const encrypted = JSON.parse(inputBuffer);
    const decrypted = await eccrypto.decrypt(privateKey, {
      iv: Buffer.from(encrypted.iv, 'hex'),
      ephemPublicKey: Buffer.from(encrypted.ephemPublicKey, 'hex'),
      ciphertext: Buffer.from(encrypted.ciphertext, 'hex'),
      mac: Buffer.from(encrypted.mac, 'hex')
    });
    return decrypted;
}

const inputFileBuffer = fs.readFileSync('./p6-2.png');
encryptFile(inputFileBuffer,publicKey)
  .then(encryptedBuffer => {
    fs.writeFileSync('enc-p6-2.json', encryptedBuffer);
    console.log('File encrypted and saved as encrypted-file.json');
  })
.catch(error => console.error('Error encrypting file:', error)).then(()=>{
    
    const encryptedData = fs.readFileSync('enc-p6-2.json');
    decryptFile(encryptedData,privateKey)
      .then(decrypted => {
        fs.writeFileSync('dec-p6-2.png', decrypted);
        console.log('File decrypted and saved to decrypted-p6-2.png');
      })
      .catch(err => console.error('Error decrypting:', err));

})
