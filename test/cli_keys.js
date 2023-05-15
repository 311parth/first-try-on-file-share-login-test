const eccrypto = require('eccrypto');
const fs = require('fs');

async function generateKeys() {
  // Generate a new private/public key pair
  const privateKey = await eccrypto.generatePrivate();
  const publicKey = eccrypto.getPublic(privateKey);

  // Save the keys to a file
  const keys = { privateKey, publicKey };
  console.log(keys,typeof(keys))
  // fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));

  console.log('Keys generated and saved to keys.json');
  return keys;
}

generateKeys();
