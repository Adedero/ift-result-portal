export default function base64urlToBase64(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

 /*  switch (base64.length % 4) {
    case 2: return base64 + '==';
    case 3: return base64 + '=';
    default: return base64;
  } */
}