import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { createGroup } from "../store/slices/chat-slice";
import { generateGroupKey, encryptGroupKeyForMember } from "../utils/groupcrypto";
import { generateKeypair } from "../utils/crypto";
export default function GroupModal({ contacts, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const dispatch = useDispatch();
  const curPass = useSelector((state) => state.user.password);
  const curUser = useSelector((state) => state.user.user);

  useEffect(() => {
    console.log(contacts);
  }, []);

  useEffect(() => {
    console.log(selectedMembers);
  }, [selectedMembers]);

  const handleMemberSelection = (contact) => {
    if (selectedMembers.find((member) => member.id === contact.id)) {
      console.log("Contact already present!");
      setSelectedMembers(selectedMembers.filter((member) => member.id !== contact.id));
    } else {
      console.log("Contact not present!");
      const newMember = {
        id: contact.id,
        username: contact.username,
        public_key: contact.public_key,
      }
      setSelectedMembers([...selectedMembers, newMember]);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      try {
        // Generate a random AES group key
        const groupKey = await generateGroupKey();

        console.log("Group Key generated: "+groupKey);
  
        // Fetch admin's private key and public key from secure storage / Redux
        const keyPair = await generateKeypair(curPass);

        console.log("Admin's public key: "+keyPair.privateKey);
  
        if (!keyPair.privateKey || !curUser.public_key) {
          console.error("Admin keys not found.");
          return;
        }
  
        // Encrypt the group key for each member, including the admin
        const updatedMembers = await Promise.all(
          [...selectedMembers, { id: curUser.id, username: curUser.username, public_key: keyPair.publicKey }]
          .map(async (member) => {
            const { encryptedKey, nonce } = await encryptGroupKeyForMember(
              groupKey,
              member.public_key,
              keyPair.privateKey
            );

            console.log("Member's group key generated!");
            console.log(encryptedKey, nonce);
  
            return {
              ...member,
              encrypted_group_key: {
                encryptedKey,
                nonce,
              }
            };
          })
        );

        console.log(updatedMembers);
  
        // Dispatch action to create group with encrypted keys
        dispatch(
          createGroup({
            name: groupName,
            members: updatedMembers, // Now includes the admin as well
          })
        );
  
        // Reset state and close modal
        setSelectedMembers([]);
        setGroupName("");
        onClose();
      } catch (error) {
        console.error("Error creating group:", error);
      }
    }
  };  

  const handleCancelCreate = () => {
    setSelectedMembers([]);
    setGroupName("");
    onClose();
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
              <>
                {(contact?.phone_verified || contact?.email_verified) && <MemberItem key={contact.id}>
                  <label htmlFor={contact.id}>{contact.username}</label>
                  <AddButton
                    onClick={() => handleMemberSelection(contact)}
                  >
                    {selectedMembers.find((member) => member.id === contact.id) ? "Remove" : "Add"}
                  </AddButton>
                </MemberItem>}
              </>
            ))}
          </MembersList>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => handleCancelCreate()}>Cancel</button>
          <button onClick={() => handleCreateGroup()}>Create</button>
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