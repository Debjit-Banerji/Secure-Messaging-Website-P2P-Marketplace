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
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
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
  width: 100%;
  height: 100%;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar img {
        height: 3rem;
      }
      .username h3 {
        color: white;
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
      }
    }
    .sent {
      justify-content: flex-end;
      .content {
        background-color: rgba(134, 120, 237, 0.76);
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
