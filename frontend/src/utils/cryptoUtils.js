import { Buffer } from "buffer";

export const deriveAESKey = async (password) => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array([]), // No salt
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (key, data) => {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Random IV
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  return {
    ciphertext: Buffer.from(new Uint8Array(encrypted)).toString("base64"),
    iv: Buffer.from(iv).toString("base64") // Store IV with the ciphertext
  };
};


export const decryptData = async (key, encryptedData, iv) => {
  try {
    const decoder = new TextDecoder();

    // Convert IV correctly to Uint8Array
    const ivArray = new Uint8Array([...atob(iv)].map(c => c.charCodeAt(0)));

    // Convert encryptedData (ciphertext) correctly to Uint8Array
    const encryptedArray = new Uint8Array([...atob(encryptedData)].map(c => c.charCodeAt(0)));

    // Perform decryption
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      encryptedArray
    );

    const result = decoder.decode(decrypted);
    return result;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
};

export const hashPasswordSHA256 = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Buffer.from(new Uint8Array(hashBuffer)).toString("hex"); // Convert to hex
};

