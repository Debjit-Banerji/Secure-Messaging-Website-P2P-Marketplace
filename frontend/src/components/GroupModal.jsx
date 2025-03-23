import React, { useState } from "react";
import styled from "styled-components";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { createGroup } from "../store/slices/chat-slice";
import { 
  generateKeypair, 
  generateGroupKey, 
  createGroupKeyPackage, 
  extractGroupKey 
} from "../utils/cryptoUtils";

export default function GroupModal({ contacts, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const dispatch = useDispatch();

  const handleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      try {
        // Dispatch group creation to Redux
        dispatch(createGroup({ name: groupName, members: selectedMembers }));
        
        // Generate keypairs for all users using their passwords
        // Note: In a real application, you would retrieve keys from a secure store
        // rather than generating them from passwords each time
        const aliceKeys = await generateKeypair("alicePassword", "alice");
        const bobKeys = await generateKeypair("bobPassword", "bob");
        const charlieKeys = await generateKeypair("charliePassword", "charlie");
        const adminKeys = await generateKeypair("adminPassword", "admin");

        // Admin generates a group key
        const groupKey = await generateGroupKey();

        // Admin distributes the group key to all members
        const keyPackage = await createGroupKeyPackage(
          "group123", 
          groupKey, 
          {
            "alice": aliceKeys.publicKey, 
            "bob": bobKeys.publicKey, 
            "charlie": charlieKeys.publicKey
          }, 
          adminKeys.privateKey
        );

        // Each member extracts their group key
        const aliceGroupKey = await extractGroupKey(
          keyPackage, 
          "alice", 
          aliceKeys.privateKey, 
          adminKeys.publicKey
        );
        
        // In a real app, you would store the group key securely
        // and use it for encrypting/decrypting group messages
        
        onClose();
      } catch (error) {
        console.error("Error creating group:", error);
        // Handle error appropriately (show user error message)
      }
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Create Group</h3>
          <MdClose onClick={onClose} className="close-icon" />
        </ModalHeader>
        <ModalBody>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <h4>Select Members</h4>
          <MembersList>
            {contacts.map((contact) => (
              <MemberItem key={contact.id}>
                <label htmlFor={contact.id}>{contact.username}</label>
                <AddButton
                  onClick={() => handleMemberSelection(contact.id)}
                  selected={selectedMembers.includes(contact.id)}
                >
                  {selectedMembers.includes(contact.id) ? "Added" : "Add"}
                </AddButton>
              </MemberItem>
            ))}
          </MembersList>
        </ModalBody>
        <ModalFooter>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreateGroup}>Create</button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1a1f36;
  padding: 1.5rem;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: #f8f9fe;
  }

  .close-icon {
    cursor: pointer;
    font-size: 1.5rem;
    color: #b8c7eb;

    &:hover {
      color: #5d8bfc;
    }
  }
`;

const ModalBody = styled.div`
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    background: #252a4a;
    color: #f8f9fe;
    margin-bottom: 1rem;

    &:focus {
      outline: none;
      border-color: #5d8bfc;
    }
  }

  h4 {
    margin-bottom: 0.5rem;
    color: #f8f9fe;
  }
`;

const MembersList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;

  label {
    color: #f8f9fe;
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#4a78e8" : "#5d8bfc")};
  color: white;

  &:hover {
    background: #4a78e8;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #5d8bfc;
    color: white;

    &:hover {
      background: #4a78e8;
    }

    &:first-child {
      background: #2a304f;

      &:hover {
        background: #3a405f;
      }
    }
  }
`;