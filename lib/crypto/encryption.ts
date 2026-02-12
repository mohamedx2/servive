import CryptoJS from 'crypto-js';

/**
 * Derives a strong encryption key from a user password and salt using PBKDF2.
 * @param password The user's plaintext password
 * @param salt The user's unique salt (stored in DB)
 * @returns A Hex string of the derived key
 */
export const deriveKey = (password: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 600000,
    hasher: CryptoJS.algo.SHA256,
  });
  return key.toString();
};

/**
 * Encrypts a plaintext string using AES.
 * @param plaintext Data to encrypt
 * @param secretKey Derived secret key
 * @returns The encrypted ciphertext
 */
export const encryptData = (plaintext: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(plaintext, secretKey).toString();
};

/**
 * Decrypts a ciphertext string using AES.
 * @param ciphertext Encrypted data
 * @param secretKey Derived secret key
 * @returns Plaintext string or null if decryption fails
 */
export const decryptData = (ciphertext: string, secretKey: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) return null;
    return originalText;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

/**
 * Generates a unique secure salt for key derivation.
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};
