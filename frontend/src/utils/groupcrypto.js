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

// Create a group key package for distributing to all members
export const createGroupKeyPackage = async (groupId, groupKey, membersPublicKeys, myPrivateKey) => {
    const sodium = await initializeSodium();
    
    const encryptedKeys = {};
    
    // Encrypt group key for each member using their public key
    for (const [memberId, publicKey] of Object.entries(membersPublicKeys)) {
        const encryptedKeyData = await encryptGroupKeyForMember(
            groupKey,
            publicKey,
            myPrivateKey
        );
        
        encryptedKeys[memberId] = encryptedKeyData;
    }
    
    // Store the encrypted keys in a server or database
    await storeKeyPackage(groupId, encryptedKeys);
    
    return {
        groupId,
        timestamp: Date.now(),
        encryptedKeys
    };
};

// Fetch and decrypt the group key for a user
export const fetchAndDecryptGroupKey = async (groupId, myId, myPrivateKey, distributorPublicKey) => {
    // Fetch the key package from the server
    const keyPackage = await fetchKeyPackage(groupId, myId);
    
    if (!keyPackage) {
        throw new Error("No key package found for this user.");
    }
    
    // Decrypt the group key
    const groupKey = await decryptGroupKey(
        keyPackage.encryptedKeys[myId],
        distributorPublicKey,
        myPrivateKey
    );
    
    return groupKey;
};

// Rotate the group key when a member joins or leaves
export const rotateGroupKey = async (oldGroupKey) => {
    const sodium = await initializeSodium();
    
    // Generate a new random key
    const newGroupKey = sodium.randombytes_buf(32);
    
    // Hash the old key with the new key for linking purposes
    const keyLink = sodium.crypto_generichash(
        32,
        newGroupKey,
        sodium.from_hex(oldGroupKey)
    );
    
    return {
        groupKey: sodium.to_hex(newGroupKey),
        keyLink: sodium.to_hex(keyLink)
    };
};

// Encrypt a message with the current group key
export const encryptWithGroupKey = async (groupKey, senderId, message, messageId, keyVersion) => {
    const sodium = await initializeSodium();
    
    // Use message ID and sender ID to create a unique nonce
    const nonceInput = messageId + senderId;
    const nonceBase = sodium.crypto_generichash(sodium.crypto_secretbox_NONCEBYTES - 8, sodium.from_string(nonceInput));
    
    // Add a random component to the nonce
    const randomPart = sodium.randombytes_buf(8);
    const nonce = new Uint8Array(sodium.crypto_secretbox_NONCEBYTES);
    nonce.set(nonceBase);
    nonce.set(randomPart, nonceBase.length);
    
    // Convert message to bytes if it's a string
    let messageBytes;
    if (typeof message === "string") {
        messageBytes = sodium.from_string(message);
    } else if (message instanceof Uint8Array) {
        messageBytes = message;
    } else {
        throw new Error("Unsupported input type for encryption.");
    }
    
    // Include key version in the payload
    const payload = JSON.stringify({
        sender: senderId,
        content: typeof message === "string" ? message : "[BINARY_DATA]",
        timestamp: Date.now(),
        keyVersion // Add key version to the payload
    });
    
    // Encrypt the payload
    const ciphertext = sodium.crypto_secretbox_easy(
        sodium.from_string(payload),
        nonce,
        sodium.from_hex(groupKey)
    );
    
    return {
        nonce: sodium.to_hex(nonce),
        ciphertext: sodium.to_hex(ciphertext),
        messageId,
        keyVersion // Include key version in the encrypted message
    };
};

// Decrypt a message encrypted with the group key
export const decryptWithGroupKey = async (groupKey, encryptedMessage) => {
    const sodium = await initializeSodium();
    
    const groupKeyBytes = sodium.from_hex(groupKey);
    const nonceBytes = sodium.from_hex(encryptedMessage.nonce);
    const ciphertextBytes = sodium.from_hex(encryptedMessage.ciphertext);
    
    // Decrypt the message
    const decrypted = sodium.crypto_secretbox_open_easy(
        ciphertextBytes,
        nonceBytes,
        groupKeyBytes
    );
    
    // Parse the payload
    const payload = JSON.parse(new TextDecoder().decode(decrypted));
    
    // Verify key version
    if (payload.keyVersion !== getCurrentKeyVersion()) {
        throw new Error("Invalid key version. Please fetch the latest group key.");
    }
    
    return payload;
};

// Example function to store key packages
const storeKeyPackage = async (groupId, encryptedKeys) => {
    // Save encryptedKeys to a database or server
    // Example: database.save({ groupId, encryptedKeys });
};

// Example function to fetch key packages
const fetchKeyPackage = async (groupId, myId) => {
    // Fetch the key package from the database or server
    // Example: return database.get({ groupId, userId: myId });
};

// Example function to get the current key version
const getCurrentKeyVersion = () => {
    // Return the current key version (e.g., from a database or server)
    return "v1"; // Replace with actual logic
};