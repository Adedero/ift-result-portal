export default function maskEmail(email, maskChar = '*') {
  const [username, domain] = email.split('@');

  // Mask the username, keeping the first and last character
  if (username.length > 2) {
    const maskedUsername = maskString(username, 2, 1, maskChar);
    return `${maskedUsername}@${domain}`;
  }

  return email; // Return the original if it's too short to mask
}