function getPinExpiry(validityPeriod) {
  const [n, t] = validityPeriod.split(" ");
  const num = parseInt(n, 10);
  let multiplier;

  if (t.includes("minute")) {
    multiplier = 60 * 1000; // Minutes to milliseconds
  } else if (t.includes("hour")) {
    multiplier = 60 * 60 * 1000; // Hours to milliseconds
  } else {
    throw new Error("Invalid time unit. Only 'minutes' or 'hours' are supported.");
  }

  const expiryTime = Date.now() + num * multiplier;
  return new Date(expiryTime);
}

module.exports = getPinExpiry;