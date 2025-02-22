export const generateRSAKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );
  
    return keyPair;
  }
  
  export const encryptWithPublicKey = async (publicKey, data) => {
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      encoder.encode(data)
    );
    return Buffer.from(new Uint8Array(encrypted)).toString("base64");
  }
  
  export const decryptWithPrivateKey = async (privateKey, encryptedData) => {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      Buffer.from(encryptedData, "base64")
    );
  
    return new TextDecoder().decode(decrypted);
  }
  