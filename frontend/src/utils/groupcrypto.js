import * as sodium from "libsodium-wrappers-sumo";

// Ensure sodium is initialized before use
const initializeSodium = async () => {
    await sodium.ready;
    return sodium;
};

// Generate a random group key
export const generateGroupKey = async () => {
    const sodium = await initializeSodium();
    // Generate a random 32-byte group key
    const groupKey = sodium.randombytes_buf(32);
    return sodium.to_hex(groupKey);
};

// Encrypt the group key for a specific member using their public key
export const encryptGroupKeyForMember = async (groupKey, memberPublicKey, myPrivateKey) => {
    const sodium = await initializeSodium();
    
    // Convert keys to appropriate format
    const groupKeyBytes = sodium.from_hex(groupKey);
    const memberPublicKeyBytes = sodium.from_hex(memberPublicKey);
    const myPrivateKeyBytes = sodium.from_hex(myPrivateKey);
    
    // Generate a random nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    
    // Encrypt the group key for the specific member
    const encryptedGroupKey = sodium.crypto_box_easy(
        groupKeyBytes,
        nonce,
        memberPublicKeyBytes,
        myPrivateKeyBytes
    );
    
    return {
        nonce: sodium.to_hex(nonce),
        encryptedKey: sodium.to_hex(encryptedGroupKey)
    };
};

// Decrypt the group key that was encrypted for you
export const decryptGroupKey = async (encryptedData, senderPublicKey, myPrivateKey) => {
    const sodium = await initializeSodium();
    console.log(encryptedData);
    const senderPublicKeyBytes = sodium.from_hex(senderPublicKey);
    const myPrivateKeyBytes = sodium.from_hex(myPrivateKey);
    const nonceBytes = sodium.from_hex(encryptedData.nonce);
    const encryptedKeyBytes = sodium.from_hex(encryptedData.encryptedKey);
    
    const decryptedKey = sodium.crypto_box_open_easy(
        encryptedKeyBytes,
        nonceBytes,
        senderPublicKeyBytes,
        myPrivateKeyBytes
    );
    
    return sodium.to_hex(decryptedKey);
};

// Encrypt a message with the group key (without nonce or key version)
export const encryptWithGroupKey = async (groupKey, message) => {
    const sodium = await initializeSodium();

    // Convert message to bytes
    const messageBytes = typeof message === "string" ? sodium.from_string(message) : message;
    const groupKeyBytes = sodium.from_hex(groupKey);

    // Encrypt the message using the group key
    const ciphertext = sodium.crypto_secretbox_easy(
        messageBytes,
        new Uint8Array(sodium.crypto_secretbox_NONCEBYTES), // Using a zeroed nonce
        groupKeyBytes
    );

    return {
        ciphertext: sodium.to_hex(ciphertext),
    };
};

// Decrypt a message with the group key (without nonce or key version)
export const decryptWithGroupKey = async (groupKey, encryptedMessage) => {
    const sodium = await initializeSodium();

    const groupKeyBytes = sodium.from_hex(groupKey);
    const ciphertextBytes = sodium.from_hex(encryptedMessage);

    // Decrypt the message using a zeroed nonce
    const decrypted = sodium.crypto_secretbox_open_easy(
        ciphertextBytes,
        new Uint8Array(sodium.crypto_secretbox_NONCEBYTES), // Using a zeroed nonce
        groupKeyBytes
    );

    return new TextDecoder().decode(decrypted);
};
