const crypto = require('node:crypto');

function generateRandomPin(length = 10, type = 'numeric') {
  const charSets = {
    numeric: '0123456789',
    num: '0123456789',
    alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  };

  const charSet = charSets[type.toLowerCase()] || charSets['numeric'];
  const charSetLength = charSet.length;
  let pin = '';

  while (pin.length < length) {
    const randomBytes = crypto.randomBytes(1); // Generate one byte at a time
    const randomValue = randomBytes[0];

    // Only use values within the range of the charset
    if (randomValue < charSetLength) {
      pin += charSet[randomValue];
    }
  }

  return pin;
}

module.exports = generateRandomPin;
