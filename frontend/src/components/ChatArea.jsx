
// new with group setting h 
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { getChats, sendChat } from "../store/slices/chat-slice";
import DefaultProfilePic from "../assets/profileicon.png";
import { deriveSharedKey, decryptMessage, encryptMessage, generateKeypair } from "../utils/crypto";

export default function ChatArea({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [messageStatus, setMessageStatus] = useState({}); // Track message status (sent, delivered, read)
  const [messageReadBy, setMessageReadBy] = useState({}); // Track which members have read each message
  const scrollRef = useRef();
  const sentMessages = useSelector((state) => state.chat.sent_chats);
  const receivedMessages = useSelector((state) => state.chat.received_chats);
  const curPassword = useSelector((state) => state.user.password);
  const dispatch = useDispatch();

  const [encryptionKey, setEncryptionKey] = useState(null);
  const isGroup = currentChat?.isGroup || false; // Check if it's a group chat

  useEffect(() => {
    let isMounted = true; // Flag to track component mount status

    const fetchChatsAndKey = async () => {
      try {
        dispatch(getChats({ ...currentChat }));
        if (!isGroup) {
          const keyPair = await generateKeypair(curPassword);
          const key = await deriveSharedKey(keyPair.privateKey, currentChat.public_key);
          if (isMounted) {
            setEncryptionKey(key);
          }
        }
      } catch (error) {
        console.error("Error deriving shared key:", error);
      }
    };

    fetchChatsAndKey();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [currentChat]);

  useEffect(() => {
    console.log("Encryption Key Updated:", encryptionKey);
  }, [encryptionKey]);

  useEffect(() => {
    if (encryptionKey !== null || isGroup) {
      const decryptMessages = async () => {
        try {
          const mergedMessages = [...sentMessages, ...receivedMessages]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          const decryptedMessages = await Promise.all(
            mergedMessages.map(async (message) => ({
              ...message,
              content: isGroup
                ? message.message // No decryption for group messages
                : await decryptMessage(encryptionKey, message.nonce, message.message),
            }))
          );

          console.log(decryptedMessages);
          setMessages(decryptedMessages);
        } catch (error) {
          console.error("Error decrypting messages:", error);
        }
      };

      decryptMessages();
    }
  }, [sentMessages, receivedMessages, encryptionKey, isGroup]);

  const handleSendMsg = async (msg) => {
    if (encryptionKey !== null || isGroup) {
      try {
        let encryptedMessage;
        if (!isGroup) {
          encryptedMessage = await encryptMessage(encryptionKey, msg.content);
        }

        const temp = {
          receiver: currentChat.id,
          message: isGroup ? msg.content : encryptedMessage.ciphertext,
          nonce: isGroup ? null : encryptedMessage.nonce,
          type: msg.type,
          fileType: msg.fileType || null,
          fileName: msg.fileName || null,
          isGroup, // Include whether it's a group message
        };
        dispatch(sendChat({ ...temp }));

        // Update message status (sent)
        setMessageStatus((prev) => ({
          ...prev,
          [temp.messageId]: "sent",
        }));

        // Simulate message delivery and read status (for demo purposes)
        setTimeout(() => {
          setMessageStatus((prev) => ({
            ...prev,
            [temp.messageId]: "delivered",
          }));
        }, 1000);

        setTimeout(() => {
          setMessageStatus((prev) => ({
            ...prev,
            [temp.messageId]: "read",
          }));
        }, 2000);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleFileClick = (message) => {
    console.log("ChatArea: " + message);
    // Convert Base64 to Blob
    const byteCharacters = atob(message);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: message.fileType });

    // Create a Blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = message.fileName || "download";
    document.body.appendChild(link);

    // Simulate a click to open in a relevant app
    link.click();

    // Cleanup: Remove link after opening
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  // Check if a message is read by all members
  const isMessageReadByAll = (messageId) => {
    if (!isGroup) return false; // Only for group chats
    const readBy = messageReadBy[messageId] || [];
    return readBy.length === currentChat.members.length;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={DefaultProfilePic} alt="" />
            <div className="online-indicator"></div>
          </div>
          <div className="username">
            <h3>{currentChat.username || currentChat.name}</h3>
            <span className="status">
              {isGroup ? `${currentChat.members?.length || 0} members` : "Online"}
            </span>
          </div>
          {/* Group Settings button has been removed */}
        </div>
        <div className="actions">
          <button className="action-btn">
            <i className="fas fa-phone"></i>
          </button>
          <button className="action-btn">
            <i className="fas fa-video"></i>
          </button>
          <button className="action-btn">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length > 0 &&
          messages.map((message) => {
            const fromSelf = message.sender !== currentChat.id;
            const isReadByAll = isMessageReadByAll(message.messageId); // Check if message is read by all members
            return (
              <div ref={scrollRef} key={uuidv4()}>
                <div className={`message ${fromSelf ? "sent" : "received"}`}>
                  <div className="content">
                    {message.type === "file" ? (
                      <div className="file-box">
                        <p>{message.fileName} ({message.fileType})</p>
                        <a href={`data:${message.fileType};base64,${message.content}`} target="_blank" rel="noopener noreferrer">
                          Open File
                        </a>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div className="message-status">
                      {messageStatus[message.messageId] === "read" ? (
                        <span style={{ color: isReadByAll ? "#38d77a" : "#b8c7eb" }}>✓✓</span>
                      ) : messageStatus[message.messageId] === "delivered" ? (
                        <span>✓✓</span>
                      ) : messageStatus[message.messageId] === "sent" ? (
                        <span>✓</span>
                      ) : null}
                    </div>
                  </div>
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
      align-items: center;

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

    .sent {
      justify-content: flex-end;

      .content {
        background-color: #5d8bfc;
        border-bottom-right-radius: 4px;
      }
    }

    .received {
      justify-content: flex-start;

      .content {
        background-color: #2a304f;
        border-bottom-left-radius: 4px;
      }
    }
  }
`;
