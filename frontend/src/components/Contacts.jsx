import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DefaultProfilePic from "../assets/profileicon.png";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  // useEffect(async () => {
  //   const data = await JSON.parse(
  //     localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  //   );
  //   setCurrentUserName(data.username);
  //   setCurrentUserImage(data.avatarImage);
  // }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      {!currentUserName && !currentUserImage && (
        <Container>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={DefaultProfilePic}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={DefaultProfilePic}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{`Eric`}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: auto 10%;
  padding-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;
  background-color: #080420;
  overflow: hidden;

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    gap: 0.8rem;
    padding: 0.5rem 0;
    
    &::-webkit-scrollbar {
      width: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 5px;
    }

    .contact {
      width: 90%;
      min-height: 4.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.6rem;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      
      &:hover {
        background-color: #1e1e60;
        transform: scale(1.02);
      }
      
      .avatar {
        img {
          height: 3rem;
          border-radius: 50%;
        }
      }

      .username {
        h3 {
          color: white;
          font-size: 1rem;
        }
      }
    }

    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    border-top: 2px solid rgba(255, 255, 255, 0.1);

    .avatar img {
      height: 3.5rem;
      border-radius: 50%;
    }

    .username h2 {
      color: white;
      font-size: 1.1rem;
    }

    @media screen and (max-width: 1080px) {
      gap: 0.5rem;
      .username h2 {
        font-size: 1rem;
      }
    }
  }
`;
