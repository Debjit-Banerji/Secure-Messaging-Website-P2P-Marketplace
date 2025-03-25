import React, { useState, useRef } from "react";
import styled from "styled-components";
import { BsEmojiSmile } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { MdAttachFile } from "react-icons/md";
import { BiMicrophone } from "react-icons/bi";
import { FaFileImage, FaFileAudio, FaFileVideo, FaFileAlt } from "react-icons/fa";
import Picker from "emoji-picker-react";
import { useSelector } from "react-redux";

export default function ChatInput({ handleSendMsg, isGroup }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const fileInputRef = useRef(null);
  const userData = useSelector((state) => state.user.user);

  // Handle Emoji Click
  const onEmojiClick = (emojiObject) => {
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Handle Sending Chat
  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg({ type: "text", content: msg, isGroup });
      setMsg("");
    }
  };

  // Handle File Selection
  const handleFileSelect = (fileType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = fileType;
      fileInputRef.current.click();
    }
  };

  // Convert File to Base64 and Send
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64String = reader.result.split(",")[1]; // Remove Base64 prefix
          const fileBytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0)); // Convert Base64 to Uint8Array

          handleSendMsg({ 
              type: "file", 
              fileType: file.type, 
              content: fileBytes, 
              isGroup,
          });
      };
      reader.readAsDataURL(file);
      setShowAttachOptions(false);
    }
  };


  return (
    <Container>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* Attachments Menu */}
      {(userData?.email_verified || userData?.phone_verified) && showAttachOptions && (
        <div className="attach-options">
          <button onClick={() => handleFileSelect("image/*")}>
            <FaFileImage /> Image
          </button>
          <button onClick={() => handleFileSelect("application/pdf,application/msword")}>
            <FaFileAlt /> Document
          </button>
          <button onClick={() => handleFileSelect("audio/*")}>
            <FaFileAudio /> Audio
          </button>
          <button onClick={() => handleFileSelect("video/*")}>
            <FaFileVideo /> Video
          </button>
        </div>
      )}

      <div className="button-container">
        <div className="emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <BsEmojiSmile />
        </div>
        <div className="attach" onClick={() => setShowAttachOptions(!showAttachOptions)}>
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

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: rgba(26, 28, 47, 0.8);
  padding: 0 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  gap: 1rem;

  .emoji-picker {
    position: absolute;
    bottom: 50px;
    left: 10px;
    z-index: 10;
  }

  .attach-options {
    position: absolute;
    bottom: 50px;
    left: 70px;
    background: rgba(40, 44, 66, 0.9);
    padding: 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 10;

    button {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      color: white;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 5px;
      transition: all 0.2s ease-in-out;

      &:hover {
        color: #5d8bfc;
      }
    }
  }

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
