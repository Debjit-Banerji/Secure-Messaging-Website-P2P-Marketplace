import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addGroupMember, fetchGroupDetails, fetchUserDataForGroup, removeGroupMember } from "../store/slices/chat-slice";
import { decryptGroupKey, encryptGroupKeyForMember } from "../utils/groupcrypto";
import { generateKeypair } from "../utils/crypto";

export default function GroupSettingsModal({ group, onClose, contacts }) {
  const dispatch = useDispatch();
  const curPass = useSelector((state) => state.user.password);
  const curUser = useSelector((state) => state.user.user);
  const groupKeyData = useSelector((state) => state.chat.cur_group_data);
  const groupData = useSelector((state) => state.chat.cur_group);

  useEffect(() => {
    dispatch(fetchGroupDetails({groupId: group?.id}));
    console.log(contacts);
  }, [])

  const handleAddMember = async (contact) => {
    try {
      const keyPair = await generateKeypair(curPass);
      await dispatch(fetchUserDataForGroup({groupId: group?.id})).then(async (response) => {
        if(groupKeyData){
          console.log(groupKeyData);
          const sharedKey = await decryptGroupKey(groupKeyData?.encrypted_key, keyPair?.publicKey, keyPair?.privateKey);
          // Encrypt the group key for the new member before sending the request
          const encryptedKey = await encryptGroupKeyForMember(sharedKey, contact?.public_key, keyPair?.privateKey);
          dispatch(addGroupMember({ groupId: group?.id, memberId: contact?.id, encryptedKey: encryptedKey }));
        }        
      });
    } catch (error) {
        console.error("Error encrypting group key for new member:", error);
    }
  };

  const handleRemoveMember = (memberId) => {
      dispatch(removeGroupMember({ groupId: group?.id, memberId }));
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h3>Group Settings</h3>
          <MdClose onClick={onClose} className="close-icon" />
        </ModalHeader>
        <ModalBody>
          <h4>Current Members</h4>
          <MembersList>
            {groupData?.members?.map((member) => (
              <MemberItem key={member.id}>
                <span>{member.username}</span>
              </MemberItem>
            ))}
          </MembersList>

          <h4>Add Members</h4>
          <MembersList>
          {contacts
            ?.filter((contact) => 
              !groupData?.members?.some((member) => member.id === contact.id) // Exclude existing members
            )
            .map((contact) => (
              <MemberItem key={contact.id}>
                <span>{contact.username}</span>
                <button onClick={() => handleAddMember(contact)}>Add</button>
              </MemberItem>
            ))}
          </MembersList>

          <h4>Remove Members</h4>
          <MembersList>
            {groupData?.members
            ?.filter((member) => member.id !== curUser.id) // Exclude admin
            .map((member) => (
              <MemberItem key={member.id}>
                <span>{member.username}</span>
                <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
              </MemberItem>
            ))}
          </MembersList>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}

// Default props
GroupSettingsModal.defaultProps = {
  contacts: [],
};

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
  color: #f8f9fe;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.3rem;
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
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  span {
    font-size: 0.9rem;
    color: #f8f9fe;
  }

  button {
    background: #5d8bfc;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;

    &:hover {
      background: #4a78e8;
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  button {
    background: #2a304f;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      background: #3a405f;
    }
  }
`;