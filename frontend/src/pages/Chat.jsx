import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {styled, createGlobalStyle} from "styled-components";
import NavBar from "../components/NavBar";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatArea from "../components/ChatArea";
import { host } from "../store/redux-store";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts } from "../store/slices/user-slice";
import { fetchUserGroups } from "../store/slices/chat-slice";
import { changeChats } from "../store/slices/chat-slice";

export default function Chat() {
  const dispatch = useDispatch();
  const socket = useRef();
  const contacts = useSelector((state) => state.user.contacts);
  const userGroups = useSelector((state) => state.chat.groups);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isGroup, setIsGroup] = useState(undefined);

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchUserGroups());
  }, []);

  useEffect(() => {
    console.log(userGroups);
  }, [userGroups]);


  useEffect(() => {
    console.log(currentChat);
  } ,[currentChat]);

  const handleChatChange = (chat, isGroup) => {
    dispatch(changeChats());
    setCurrentChat(chat);
    setIsGroup(isGroup);
  };


  return (
    <>
    <GlobalStyle />
    <MainContainer>
      <NavBarContainer>
        <NavBar />
      </NavBarContainer>
      <ContentContainer>
        <Container>
          <ContactsContainer><Contacts contacts={contacts} groups={userGroups} changeChat={handleChatChange} /></ContactsContainer>
           {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatArea currentChat={currentChat} socket={socket} isGroup={isGroup}/>
          )}
        </Container>
      </ContentContainer>
    </MainContainer>
    </>
  );  
}

const ContactsContainer = styled.div`
  width: 25%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #181c38;
  box-sizing: border-box;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
`;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #0f1225;
  }

  /* Hide Scrollbars */
  ::-webkit-scrollbar {
    width: 4px;
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(93, 139, 252, 0.3);
    border-radius: 10px;
  }

  -ms-overflow-style: none;
  scrollbar-width: thin;
`;

const MainContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0d1022;
`;

const NavBarContainer = styled.div`
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: #12162f;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ContentContainer = styled.div`
  margin-left: 4rem;
  width: calc(100vw - 4rem);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  padding: 1rem;
`;
