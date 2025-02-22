export const generateDHKeys = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      true,
      ["deriveKey", "deriveBits"]
    );
  
    return keyPair;
  }
  
  export const deriveSharedKey = async (privateKey, publicKey) => {
    return await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicKey
      },
      privateKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }
  