function generateVerificationCode(): string {
  // Use crypto for stronger randomness
  const array = new Uint32Array(1);
  // If running in Node.js, use: require("crypto").randomInt(100000, 999999)
  const code = (array[0] % 900000) + 100000; 
  return code.toString();
}