function isPinExpired(expiryTime) {
  const currentTime = Date.now();
  return currentTime > new Date(expiryTime);
}

module.exports = isPinExpired;