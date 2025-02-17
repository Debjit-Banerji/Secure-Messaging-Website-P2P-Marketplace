import React from "react";
import styled from "styled-components";

export default function SearchUser ({ user }) {
  return (
    <UserContainer>
      <UserInfo>
        <Avatar src={user.image} alt={user.name} />
        <UserName>{user.name}</UserName>
      </UserInfo>
      <MessageButton>Message</MessageButton>
    </UserContainer>
  );
};

// Styled Components
const UserContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const UserName = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const MessageButton = styled.button`
  padding: 5px 10px;
  font-size: 0.9rem;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;