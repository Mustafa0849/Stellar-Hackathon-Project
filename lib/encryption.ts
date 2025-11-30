/**
 * Encryption utilities for wallet data using Web Crypto API
 * Uses AES-GCM for authenticated encryption
 */

/**
 * Derive a key from a password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt wallet data with a password
 * Returns: base64-encoded string containing salt + iv + encrypted data
 */
export async function encryptWalletData(
  data: string,
  password: string
): Promise<string> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Encrypt the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
      },
      key,
      dataBuffer
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt wallet data");
  }
}

/**
 * Decrypt wallet data with a password
 * Throws error if password is incorrect
 */
export async function decryptWalletData(
  encryptedData: string,
  password: string
): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(
      atob(encryptedData),
      (c) => c.charCodeAt(0)
    );

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
      },
      key,
      encrypted.buffer as ArrayBuffer
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Incorrect password or corrupted data");
  }
}

/**
 * Check if an encrypted vault exists in storage
 */
export function hasEncryptedVault(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("caelus_encrypted_vault") !== null;
}

/**
 * Store encrypted vault in localStorage
 */
export function storeEncryptedVault(encryptedData: string): void {
  localStorage.setItem("caelus_encrypted_vault", encryptedData);
}

/**
 * Retrieve encrypted vault from localStorage
 */
export function getEncryptedVault(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("caelus_encrypted_vault");
}

/**
 * Clear encrypted vault from storage
 */
export function clearEncryptedVault(): void {
  localStorage.removeItem("caelus_encrypted_vault");
  // Also clear old unencrypted storage
  localStorage.removeItem("stellar_publicKey");
  localStorage.removeItem("stellar_secretKey");
  localStorage.removeItem("stellar_mnemonic");
  localStorage.removeItem("stellar_isReadOnly");
}

