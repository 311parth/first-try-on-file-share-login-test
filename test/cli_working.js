const fs = require('fs');
const eccrypto = require('eccrypto');
const { Command } = require('commander');

const program = new Command();

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

program
  .command('encrypt <input> <output>')
  .description('Encrypt a file')
  .action((input, output) => {
    encryptFile(input, output);
  });

program
  .command('decrypt <input> <output>')
  .description('Decrypt a file')
  .action((input, output) => {
    decryptFile(input, output);
  });

program.parse(process.argv);

//command 
// node cli_working.js encrypt p6-2.png encrypted-p6-2.json
// node cli_working.js decrypt encrypted-p6-2.json decrypted-p6-2.png
