import React, { useEffect } from "react";
import styled from "styled-components";
import DefaultProfilePic from "../assets/profileicon.png";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/user-slice";

export default function SearchUser ({ user }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);

  const handleAddContact = () => {
    const updated = {
      ...user,
      friends: [...user.friends, user.id]
    }
    dispatch(updateProfile({...updated}));
  };

  return (
    <UserContainer>
      <UserInfo>
        <Avatar src={DefaultProfilePic} alt={user.name} />
        <UserName>{user.username}</UserName>
      </UserInfo>
      <MessageButton onClick={handleAddContact}><FaPlus /> Add To Contacts</MessageButton>
    </UserContainer>
  );
};

// Styled Components
const UserContainer = styled.div`
  display: flex;
  flex-direction: row;
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
  color: white;
  font-weight: 500;
`;

const MessageButton = styled.button`
  padding: 5px 10px;
  font-size: 0.9rem;
  border: none;
  background:rgb(142, 155, 169);
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3 ease-in-out;

  &:hover {
    background: #0056b3;
  }
`;