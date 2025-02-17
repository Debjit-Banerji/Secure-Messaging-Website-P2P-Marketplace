import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {styled, createGlobalStyle} from "styled-components";
import NavBar from "../components/NavBar";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatArea from "../components/ChatArea";
import Header from "../components/Header";
import { host } from "../store/redux-store";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const tempContacts = ["John Doe", "Jane Doe", "John Smith", "Jane Smith"];

  return (
    <>
    <GlobalStyle />
    <MainContainer>
      <Header />
      <NavBarContainer>
        <NavBar />
      </NavBarContainer>
      <ContentContainer>
        <Container>
          <ContactsContainer><Contacts contacts={tempContacts} changeChat={handleChatChange} /></ContactsContainer>
           {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatArea currentChat={currentChat} socket={socket}/>
          )}
        </Container>
      </ContentContainer>
    </MainContainer>
    </>
  );  
}

const ContactsContainer = styled.div`
  width: 30%;  /* Takes 30% of parent container */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: #080420; /* Adjust background color */
  box-sizing: border-box;
  border-right: 2px solid rgba(255, 255, 255, 0.1); /* Visual separation */
`;

const GlobalStyle = createGlobalStyle`

  /* Hide Scrollbars */
  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }

  -ms-overflow-style: none; /* Internet Explorer and Edge */
  scrollbar-width: none; /* Firefox */
`;

const MainContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  margin-top: 4rem;
  overflow: hidden; /* Prevent scrolling */
`;

const NavBarContainer = styled.div`
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: rgb(26, 26, 90);
  box-sizing: border-box;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  width: 70%;  /* Takes 70% of parent container */
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  margin-left: 4rem;
  width: calc(100vw - 4rem); /* Occupy remaining width */
  min-height: calc(100vh - 5rem); /* Occupy remaining height */
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
`;
