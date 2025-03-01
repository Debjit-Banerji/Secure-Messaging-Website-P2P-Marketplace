import React, { useState } from "react";
import styled from "styled-components";
import { BsEmojiSmile } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { MdAttachFile } from "react-icons/md";
import { BiMicrophone } from "react-icons/bi";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmile />
        </div>
        <div className="attach">
          <MdAttachFile />
        </div>
      </div>
      <form className="input-container" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <div className="voice">
          <BiMicrophone />
        </div>
        <button type="submit" className="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(26, 28, 47, 0.8);
  padding: 0 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  gap: 1rem;

  .button-container {
    display: flex;
    gap: 1rem;
    
    .emoji, .attach {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #b8c7eb;
      font-size: 1.5rem;
      transition: color 0.2s ease-in-out;
      
      &:hover {
        color: #5d8bfc;
      }
    }
  }

  .input-container {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    
    input {
      width: 100%;
      border: none;
      background-color: #252a4a;
      color: #f8f9fe;
      padding: 0.8rem 3.5rem 0.8rem 1rem;
      border-radius: 2rem;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s ease;
      
      &::placeholder {
        color: #b8c7eb;
      }
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(93, 139, 252, 0.4);
        background-color: #2b304f;
      }
    }
    
    .voice {
      position: absolute;
      right: 3.5rem;
      cursor: pointer;
      color: #b8c7eb;
      font-size: 1.3rem;
      transition: color 0.2s ease-in-out;
      
      &:hover {
        color: #5d8bfc;
      }
    }
    
    .submit {
      position: absolute;
      right: 0.3rem;
      padding: 0.6rem;
      background-color: #5d8bfc;
      border: none;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
      
      svg {
        font-size: 1.2rem;
        color: white;
      }
      
      &:hover {
        background-color: #4a78e8;
      }
    }
  }
`;