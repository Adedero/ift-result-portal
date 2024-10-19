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
  const randomBytes = crypto.randomBytes(length);
  let pin = '';

  for (let i = 0; i < length; i++) {
    pin += charSet[randomBytes[i] % charSet.length]
  }

  return pin;
}

module.exports = generateRandomPin;