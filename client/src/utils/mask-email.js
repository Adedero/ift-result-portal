export default function maskEmail(email, maskChar = '*') {
  const [username, domain] = email.split('@');

  // Mask the username, keeping the first and last character
  if (username.length > 2) {
    const maskedUsername = maskString(username, 2, 1, maskChar);
    return `${maskedUsername}@${domain}`;
  }

  return email; // Return the original if it's too short to mask
}

function maskString(str, visibleStart = 2, visibleEnd = 2, maskChar = '*') {
  // Ensure the string is long enough to be masked
  if (str.length <= visibleStart + visibleEnd) {
    return str; // Return original if there's nothing to mask
  }

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);

  return start + middle + end;
}