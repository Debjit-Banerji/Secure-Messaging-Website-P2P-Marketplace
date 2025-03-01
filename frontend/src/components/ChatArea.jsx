import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { getChats, sendChat } from "../store/slices/chat-slice";
import DefaultProfilePic from "../assets/profileicon.png";

export default function ChatArea({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const sentMessages = useSelector((state) => state.chat.sent_chats);
  const receivedMessages = useSelector((state) => state.chat.received_chats);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getChats({ ...currentChat }));
  }, [currentChat]);

  useEffect(() => {
    // Merge sent and received messages and sort them by timestamp
    const mergedMessages = [...sentMessages, ...receivedMessages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    setMessages(mergedMessages);
  }, [sentMessages, receivedMessages]);

  const handleSendMsg = async (msg) => {
    const temp = {
      receiver: currentChat.id,
      message: msg,
    };
    dispatch(sendChat({ ...temp }));
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
            <h3>{currentChat.username}</h3>
            <span className="status">Online</span>
          </div>
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
            const fromSelf = message.sender === currentChat.id ? false : true;
            return (
              <div ref={scrollRef} key={uuidv4()}>
                <div className={`message ${fromSelf ? "sent" : "received"}`}>
                  <div className="content">
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  width: 70%;
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
        
        h3 {
          color: #f8f9fe;
          margin: 0;
          font-size: 1.2rem;
        }
        
        .status {
          color: #b8c7eb;
          font-size: 0.8rem;
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
