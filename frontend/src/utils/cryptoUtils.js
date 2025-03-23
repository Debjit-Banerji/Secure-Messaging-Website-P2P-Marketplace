/**
 * Crypto utilities for secure group messaging
 */

// Generate a key pair based on user password and username
export const generateKeypair = async (password, username) => {
  try {
    // Create a key from the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password + username);
    
    // Use the password to derive a key for encryption
    const keyMaterial = await window.crypto.subtle.digest('SHA-256', data);
    
    // Generate RSA key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
  } catch (error) {
    console.error("Error generating keypair:", error);
    throw error;
  }
};

// Generate a random symmetric key for the group
export const generateGroupKey = async () => {
  try {
    // Generate a random AES key for group communications
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return key;
  } catch (error) {
    console.error("Error generating group key:", error);
    throw error;
  }
};

// Create encrypted packages of the group key for each member
export const createGroupKeyPackage = async (groupId, groupKey, memberPublicKeys, adminPrivateKey) => {
  try {
    // Export the group key to raw format
    const rawGroupKey = await window.crypto.subtle.exportKey("raw", groupKey);
    
    // Create a package for each member
    const packages = {};
    
    for (const [username, publicKey] of Object.entries(memberPublicKeys)) {
      // Encrypt the group key with each member's public key
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        publicKey,
        rawGroupKey
      );
      
      // Store the encrypted key in the package
      packages[username] = {
        encryptedKey: encryptedKey,
        groupId: groupId
      };
    }
    
    return packages;
  } catch (error) {
    console.error("Error creating group key package:", error);
    throw error;
  }
};

// Extract and decrypt the group key for a specific member
export const extractGroupKey = async (keyPackage, username, privateKey, adminPublicKey) => {
  try {
    const userPackage = keyPackage[username];
    
    if (!userPackage) {
      throw new Error(`No key package found for user ${username}`);
    }
    
    // Decrypt the group key using the member's private key
    const rawGroupKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privateKey,
      userPackage.encryptedKey
    );
    
    // Import the raw key data as an AES key
    const groupKey = await window.crypto.subtle.importKey(
      "raw",
      rawGroupKey,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return groupKey;
  } catch (error) {
    console.error("Error extracting group key:", error);
    throw error;
  }
};
