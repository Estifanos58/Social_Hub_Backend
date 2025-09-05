export function generateVerificationCode(length: number): string {
  if (length <= 0) throw new Error("Length must be greater than 0");

  const min = Math.pow(10, length - 1);   // e.g., 1000 for 4 digits
  const max = Math.pow(10, length) - 1;   // e.g., 9999 for 4 digits

  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return random.toString();
}