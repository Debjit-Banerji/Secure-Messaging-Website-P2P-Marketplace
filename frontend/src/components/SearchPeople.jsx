import React, { useState } from "react";
import styled from "styled-components";
import { FiX, FiSearch } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "../store/slices/user-slice";

export default function SearchPeople({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const allUsers = useSelector((state) => state.user.users);
  const dispatch = useDispatch();

  // Trigger search when button is clicked
  const handleSearch = () => {
    dispatch(searchUsers({ searchTerm }));
  };

  return (
    <Overlay>
      <SearchBox>
        <CloseButton onClick={onClose} />
        <InputContainer>
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton onClick={handleSearch}>
            <FiSearch />
          </SearchButton>
        </InputContainer>
        <ResultContainer>
          {allUsers !== undefined && allUsers.map((user) => (
            <SearchUser key={user.id} user={user} />
          ))}
        </ResultContainer>
      </SearchBox>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SearchBox = styled.div`
  width: 600px;
  background-color: #1a1a5a;
  border: 2px solid grey;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled(FiX)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  border: 2px solid white;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 0px;
`;

const SearchButton = styled.button`
  padding: 10px;
  font-size: 1rem;
  font-style: bold;
  background-color:rgb(148, 154, 149);
  color: white;
  border: 1px solid #ddd;
  border-radius: 0px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color:#4caf50;
  }
`;

const ResultContainer = styled.div`
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
`;