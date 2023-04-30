// const elliptic = require('elliptic');
// const eccrypto = require('eccrypto');

// const curve = new elliptic.ec('secp256k1');

// const privateKeyA = curve.genKeyPair().getPrivate();
// const publicKeyA = curve.keyFromPrivate(privateKeyA).getPublic();

// const privateKeyB = curve.genKeyPair().getPrivate();
// const publicKeyB = curve.keyFromPrivate(privateKeyB).getPublic();

// console.log('Public Key A:', publicKeyA.encode('hex'));
// console.log('Private Key A:', privateKeyA.toString('hex'));

// console.log('Public Key B:', publicKeyB.encode('hex'));
// console.log('Private Key B:', privateKeyB.toString('hex'));

// const message = 'Hello, world!';

// eccrypto.encrypt(publicKeyB, Buffer.from(message)).then(function(encrypted) {
//   console.log('Encrypted message:', encrypted);

//   eccrypto.decrypt(privateKeyB, encrypted).then(function(plaintext) {
//     console.log('Decrypted message:', plaintext.toString());
//   });
// });

const eccrypto = require('eccrypto');

// Generate a key pair
async function generateKeyPair() {
  const privateKey = await eccrypto.generatePrivate();
  const publicKey = eccrypto.getPublic(privateKey);
  return { privateKey, publicKey };
}

// Encrypt data with a public key
async function encryptData(data, publicKey) {
  const encrypted = await eccrypto.encrypt(publicKey, Buffer.from(data));
  return encrypted;
}

// Decrypt data with a private key
async function decryptData(data, privateKey) {
  const decrypted = await eccrypto.decrypt(privateKey, data);
  return decrypted.toString();
}

// Example usage
async function main() {
  // Generate key pair
  const { privateKey, publicKey } = await generateKeyPair();
  // Encrypt data
  const data = 'hello world';
  const encrypted = await encryptData(data, publicKey);

  // Decrypt data
  const decrypted = await decryptData(encrypted, privateKey);
  console.log(decrypted); // Output: 'hello world'
}

main();
