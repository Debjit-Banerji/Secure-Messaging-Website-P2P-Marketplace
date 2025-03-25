import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { getChats, sendChat, getGroupChats, sendGroupChat, fetchUserDataForGroup, fetchGroupDetails, changeChats } from "../store/slices/chat-slice";
import DefaultProfilePic from "../assets/profileicon.png";
import DefaultGroupPic from "../assets/DefaultGroupPic.jpeg";
import { deriveSharedKey, decryptMessage, encryptMessage, generateKeypair } from "../utils/crypto";
import { decryptGroupKey, encryptWithGroupKey, decryptWithGroupKey } from "../utils/groupcrypto";

export default function ChatArea({ currentChat, socket, isGroup }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const dispatch = useDispatch();
  const sentMessages = useSelector((state) => state.chat.sent_chats);
  const receivedMessages = useSelector((state) => state.chat.received_chats);
  const groupChats = useSelector((state) => state.chat.group_chats || []);
  const curPassword = useSelector((state) => state.user.password);
  const curUser = useSelector((state) => state.user.user);
  const groupKeyData = useSelector((state) => state.chat.cur_group_data); //CHECK THIS
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [keyPair, setKeyPair] = useState(null);
  const groupData = useSelector((state) => state.chat.cur_group);

  useEffect(() => {
    const resetState = async () => {
      setMessages([]);  // No need for await
      setEncryptionKey(null);
      setKeyPair(null);
      await dispatch(changeChats());  // If logoutChats is an async Redux thunk
    };
  
    resetState();
  }, [currentChat]);

  useEffect(() => {
    async function initializeKeys() {
      if (!curPassword) return;
      const generatedKeyPair = await generateKeypair(curPassword);
      setKeyPair(generatedKeyPair);
      if (isGroup) {
        dispatch(fetchGroupDetails({groupId: currentChat?.id}));
        dispatch(fetchUserDataForGroup({groupId: currentChat?.id}));
        dispatch(getGroupChats({groupId: currentChat.id}));
      } else {
        dispatch(getChats({...currentChat}));
        if (currentChat?.public_key) {
          const sharedKey = await deriveSharedKey(generatedKeyPair.privateKey, currentChat.public_key);
          setEncryptionKey(sharedKey);
        }
      }
    }
    initializeKeys();
  }, [currentChat, isGroup, curPassword]);

  // New useEffect to decrypt messages only when groupKeyData updates
  useEffect(() => {
    async function decryptGroupKeys() {
      if (
        isGroup &&
        groupKeyData?.encrypted_key &&
        groupKeyData?.admin_public_key &&
        keyPair?.privateKey
      ) {
        const decryptedKey = await decryptGroupKey(
          groupKeyData.encrypted_key,
          groupKeyData.admin_public_key,
          keyPair.privateKey
        );
        setEncryptionKey(decryptedKey);
      }
    }
    decryptGroupKeys();
  }, [groupKeyData, keyPair]);

  useEffect(() => {
    const decryptMessages = async () => {
      if (!encryptionKey) {
        console.warn("Encryption key not set yet, skipping decryption.");
        return;
      }
      const allMessages = isGroup ? groupChats || [] : [...sentMessages, ...receivedMessages] || [];

      if (Array.isArray(allMessages) && allMessages?.length > 0) {
        const sortedMessages = [...allMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const decryptedMessages = await Promise.all(sortedMessages?.map(async (msg) => {
          if (isGroup) {
            console.log(msg);
            return { ...msg, content: (await decryptWithGroupKey(encryptionKey, msg?.message)) };
          } else {
            console.log(msg);
            return { ...msg, content: await decryptMessage(encryptionKey, msg.nonce, msg.message) };
          }
        }));
        setMessages(decryptedMessages || []);
      }
      else{
        console.error("allMessages is not an array:", allMessages);
      }
    };
    decryptMessages();
  }, [encryptionKey, groupChats, sentMessages, receivedMessages]);

  const handleSendMsg = async (msg) => {
    if (!encryptionKey) return;
    try {
        let encryptedMessage;
        let payload;

        if (isGroup) {
            // Encrypt message using the simplified encryptWithGroupKey function
            encryptedMessage = await encryptWithGroupKey(encryptionKey, msg.content);
            payload = {
                message: encryptedMessage.ciphertext,
                type: msg.type,
                fileType: msg.fileType || null,
                fileName: msg.fileName || null,
            };
            dispatch(sendGroupChat({groupId: currentChat.id, messageData: payload}));
        } else {
            // Encrypt message for individual chat
            encryptedMessage = await encryptMessage(encryptionKey, msg.content);
            payload = {
                receiver: currentChat.id,
                message: encryptedMessage.ciphertext,
                nonce: encryptedMessage.nonce, // Nonce is still needed for direct encryption
                type: msg.type,
                fileType: msg.fileType || null,
                fileName: msg.fileName || null,
            };
            dispatch(sendChat(payload));
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={isGroup ? DefaultGroupPic : currentChat?.profile_pic ? currentChat.profile_pic : DefaultProfilePic} alt="" />
            <div className="online-indicator"></div>
          </div>
          <div className="username">
            <h3>{currentChat?.username || currentChat?.name}</h3>
            <span className="status">
              {isGroup ? `${groupData?.members?.length || 0} members` : "Online"}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages?.length > 0 &&
          messages?.map((message) => {
            const fromSelf = isGroup ? message?.sender_id === curUser?.id : message?.sender !== currentChat?.id;
            return (
              <div className={`message ${fromSelf ? "sent" : "received"}`} ref={scrollRef} key={uuidv4()}>
                {isGroup && <p className="sender-label">{message.sender_username}</p>}
                <div className="content">
                  {message?.type === "file" ? (
                    <>
                      <div className="file-box">
                        <p>{message?.fileName} ({message?.fileType})</p>
                        <a href={`data:${message?.fileType};base64,${message?.content}`} target="_blank" rel="noopener noreferrer">
                          Open File
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{message?.content}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} isGroup={isGroup} />
    </Container>
  );
}

// Styled Components (unchanged)
const Container = styled.div`
  display: grid;
  width: 80%;
  height: 100%;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1f36 0%, #121420 100%);
  border-radius: 0 10px 10px 0;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: rgba(26, 28, 47, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-grow: 1;

      .avatar {
        position: relative;

        img {
          height: 3rem;
          width: 3rem;
          border-radius: 50%;
          border: 2px solid #5d8bfc;
          object-fit: cover;
        }

        .online-indicator {
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: #38d77a;
          border-radius: 50%;
          bottom: 2px;
          right: 2px;
          border: 2px solid #1a1c2f;
        }
      }

      .username {
        display: flex;
        flex-direction: column;
        min-width: 0; /* Allows text truncation */

        h3 {
          color: #f8f9fe;
          margin: 0;
          font-size: 1.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status {
          color: #b8c7eb;
          font-size: 0.8rem;
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 1rem;

    .action-btn {
      background: none;
      border: none;
      color: #b8c7eb;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(93, 139, 252, 0.15);
        color: #5d8bfc;
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-image: 
      linear-gradient(to bottom, 
        rgba(26, 28, 47, 0.4) 0%, 
        rgba(18, 20, 38, 0.2) 50%, 
        rgba(14, 16, 30, 0.4) 100%
      ),
      radial-gradient(circle at top right, rgba(93, 139, 252, 0.08), transparent 70%),
      radial-gradient(circle at bottom left, rgba(79, 132, 245, 0.08), transparent 70%);

    .message {
      display: flex;
      width: 100%; /* Ensure full width */

      .content {
        max-width: 65%;
        overflow-wrap: break-word;
        padding: 0.8rem 1rem;
        font-size: 1rem;
        border-radius: 18px;
        color: #f8f9fe;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

        p {
          margin: 0;
          line-height: 1.4;
        }

        .file-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.8rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          width: 200px;
          transition: all 0.3s ease-in-out;
          cursor: pointer;

          p {
            font-size: 0.9rem;
            font-weight: 600;
            color: #f8f9fe;
            margin: 0 0 0.4rem 0;
          }

          a {
            text-decoration: none;
            font-size: 0.85rem;
            color: white;
            font-weight: bold;
            background: rgba(42, 49, 67, 0.2);
            padding: 6px 10px;
            border-radius: 6px;
            transition: background 0.3s ease-in-out;

            &:hover {
              background: rgba(93, 139, 252, 0.4);
            }
          }
        }

        .message-status {
          text-align: right;
          font-size: 0.8rem;
          color: #b8c7eb;
          margin-top: 0.5rem;
        }
      }
    }

    .message.sent {
      justify-content: flex-end;
      align-items: flex-start; /* Align items to the start to prevent center alignment */

      .content {
        background-color: #5d8bfc;
        border-bottom-right-radius: 4px;
        margin-left: auto; /* Push to the right side */
      }

      .sender-label {
        font-size: 0.75rem;
        font-style: italic;
        font-weight: bold;
        color: #b8c7eb;
        margin-bottom: 2px;
        margin-left: auto; /* Align label to the right */
        text-align: right;
      }
    }

    .message.received {
      justify-content: flex-start;
      align-items: flex-start; /* Align items to the start to prevent center alignment */

      .content {
        background-color: #2a304f;
        border-bottom-left-radius: 4px;
        margin-right: auto; /* Push to the left side */
      }

      .sender-label {
        font-size: 0.75rem;
        font-style: italic;
        font-weight: bold;
        color: #b8c7eb;
        margin-bottom: 2px;
      }
    }
  }
}
`;