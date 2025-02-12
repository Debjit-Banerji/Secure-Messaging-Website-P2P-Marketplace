import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";
import SearchUser from "./SearchUser"; // Importing the SearchUser component

export default function SearchOverlay({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users from API when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.example.com/users"); // Replace with actual API
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search input
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers([]);
      return;
    }
    const results = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  return (
    <Overlay>
      <SearchBox>
        <CloseButton onClick={onClose} />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ResultContainer>
          {filteredUsers.map((user) => (
            <SearchUser key={user.id} user={user} />
          ))}
        </ResultContainer>
      </SearchBox>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SearchBox = styled.div`
  width: 400px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled(FiX)`
  align-self: flex-end;
  cursor: pointer;
  font-size: 1.5rem;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 10px;
`;

const ResultContainer = styled.div`
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
`;