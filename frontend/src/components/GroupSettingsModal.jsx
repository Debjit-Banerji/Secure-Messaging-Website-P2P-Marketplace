// // GroupSettingsModal.jsx
// import React, { useState } from "react";
// import styled from "styled-components";

// export default function GroupSettingsModal({ group, onClose, onAddMember, onRemoveMember }) {
//   const [newMember, setNewMember] = useState("");

//   const handleAddMember = () => {
//     if (newMember.trim()) {
//       onAddMember(newMember);
//       setNewMember("");
//     }
//   };

//   return (
//     <ModalOverlay>
//       <ModalContent>
//         <h3>Group Settings</h3>
//         <div>
//           <h4>Members</h4>
//           <ul>
//             {group.members.map((member) => (
//               <li key={member.id}>
//                 {member.username}
//                 <button onClick={() => onRemoveMember(member.id)}>Remove</button>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <input
//             type="text"
//             placeholder="Add member by username"
//             value={newMember}
//             onChange={(e) => setNewMember(e.target.value)}
//           />
//           <button onClick={handleAddMember}>Add</button>
//         </div>
//         <button onClick={onClose}>Close</button>
//       </ModalContent>
//     </ModalOverlay>
//   );
// }

// const ModalOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: white;
//   padding: 20px;
//   border-radius: 10px;
//   width: 400px;
// `;
// import React, { useState } from "react";
// import styled from "styled-components";
// import { MdClose } from "react-icons/md";

// export default function GroupSettingsModal({ group, onClose, onAddMember, onRemoveMember, contacts }) {
//   const [newMember, setNewMember] = useState("");

//   const handleAddMember = (memberId) => {
//     onAddMember(memberId);
//     setNewMember("");
//   };

//   return (
//     <ModalOverlay>
//       <ModalContent>
//         <ModalHeader>
//           <h3>Group Settings</h3>
//           <MdClose onClick={onClose} className="close-icon" />
//         </ModalHeader>
//         <ModalBody>
//           <h4>Members</h4>
//           <MembersList>
//             {group.members.map((member) => (
//               <MemberItem key={member.id}>
//                 <span>{member.username}</span>
//                 <button onClick={() => onRemoveMember(member.id)}>Remove</button>
//               </MemberItem>
//             ))}
//           </MembersList>
//           <h4>Add Members</h4>
//           <MembersList>
//             {contacts
//               .filter((contact) => !group.members.some((member) => member.id === contact.id))
//               .map((contact) => (
//                 <MemberItem key={contact.id}>
//                   <span>{contact.username}</span>
//                   <button onClick={() => handleAddMember(contact.id)}>Add</button>
//                 </MemberItem>
//               ))}
//           </MembersList>
//         </ModalBody>
//         <ModalFooter>
//           <button onClick={onClose}>Close</button>
//         </ModalFooter>
//       </ModalContent>
//     </ModalOverlay>
//   );
// }


// import React, { useState } from "react";
// import styled from "styled-components";
// import { MdClose } from "react-icons/md";
// import { useDispatch } from "react-redux";
// import { addGroupMember, removeGroupMember } from "../store/slices/chat-slice";

// export default function GroupSettingsModal({ group, onClose, onAddMember, onRemoveMember, contacts }) {
//   const [newMember, setNewMember] = useState("");
//   const dispatch = useDispatch();

//   const handleAddMember = (memberId) => {
//     // onAddMember(memberId);
//     dispatch(addGroupMember({ groupId: group.id, memberId: memberId }));
//     setNewMember("");
//   };
//   const handleRemoveMember = (memberId) => {
//     // onAddMember(memberId);
//     dispatch(removeGroupMember({ groupId: group.id, memberId: memberId }));
//     setNewMember("");
//   };

//   return (
//     <ModalOverlay>
//       <ModalContent>
//         <ModalHeader>
//           <h3>Group Settings</h3>
//           <MdClose onClick={onClose} className="close-icon" />
//         </ModalHeader>
//         <ModalBody>
//           <h4>Members</h4>
//           <MembersList>
//             {group.members.map((member) => (
//               <MemberItem key={member.id}>
//                 <span>{member.username}</span>
//                 <button onClick={() => onRemoveMember(member.id)}>Remove</button>
//               </MemberItem>
//             ))}
//           </MembersList>
//           <h4>Add Members</h4>
//           <MembersList>
//             {contacts && contacts
//               .filter((contact) => !group.members.some((member) => member.id === contact.id))
//               .map((contact) => (
//                 <MemberItem key={contact.id}>
//                   <span>{contact.username}</span>
//                   <button onClick={() => handleAddMember(contact.id)}>Add</button>
//                 </MemberItem>
//               ))}
//           </MembersList>
//         </ModalBody>
//         <ModalFooter>
//           <button onClick={onClose}>Close</button>
//         </ModalFooter>
//       </ModalContent>
//     </ModalOverlay>
//   );
// }

// // Default props to ensure contacts is always an array
// GroupSettingsModal.defaultProps = {
//   contacts: [],
// };


// // Styled Components
// const ModalOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 1000;
// `;

// const ModalContent = styled.div`
//   background: #1a1f36;
//   padding: 1.5rem;
//   border-radius: 10px;
//   width: 400px;
//   max-width: 90%;
//   color: #f8f9fe;
// `;

// const ModalHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 1rem;

//   h3 {
//     margin: 0;
//     font-size: 1.3rem;
//     color: #f8f9fe;
//   }

//   .close-icon {
//     cursor: pointer;
//     font-size: 1.5rem;
//     color: #b8c7eb;

//     &:hover {
//       color: #5d8bfc;
//     }
//   }
// `;

// const ModalBody = styled.div`
//   h4 {
//     margin-bottom: 0.5rem;
//     font-size: 1.1rem;
//     color: #f8f9fe;
//   }
// `;

// const MembersList = styled.div`
//   max-height: 200px;
//   overflow-y: auto;
//   margin-bottom: 1rem;
// `;

// const MemberItem = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 0.5rem 0;
//   border-bottom: 1px solid rgba(255, 255, 255, 0.1);

//   span {
//     font-size: 0.9rem;
//     color: #f8f9fe;
//   }

//   button {
//     background: #5d8bfc;
//     border: none;
//     color: white;
//     padding: 0.5rem 1rem;
//     border-radius: 5px;
//     cursor: pointer;
//     font-size: 0.8rem;

//     &:hover {
//       background: #4a78e8;
//     }
//   }
// `;

// const ModalFooter = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   margin-top: 1rem;

//   button {
//     background: #2a304f;
//     border: none;
//     color: white;
//     padding: 0.5rem 1rem;
//     border-radius: 5px;
//     cursor: pointer;
//     font-size: 0.9rem;

//     &:hover {
//       background: #3a405f;
//     }
//   }
// `;

import React, { useState } from "react";
import styled from "styled-components";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { addGroupMember, removeGroupMember } from "../store/slices/chat-slice";

export default function GroupSettingsModal({ group, onClose, contacts }) {
  const dispatch = useDispatch();

  const handleAddMember = (memberId) => {
    dispatch(addGroupMember({ groupId: group.id, memberId }));
  };

  const handleRemoveMember = (memberId) => {
    dispatch(removeGroupMember({ groupId: group.id, memberId }));
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
            {group.members.map((member) => (
              <MemberItem key={member.id}>
                <span>{member.username}</span>
              </MemberItem>
            ))}
          </MembersList>

          <h4>Add Members</h4>
          <MembersList>
            {contacts
              .filter((contact) => !group.members.some((member) => member.id === contact.id))
              .map((contact) => (
                <MemberItem key={contact.id}>
                  <span>{contact.username}</span>
                  <button onClick={() => handleAddMember(contact.id)}>Add</button>
                </MemberItem>
              ))}
          </MembersList>

          <h4>Remove Members</h4>
          <MembersList>
            {group.members.map((member) => (
              <MemberItem key={member.id}>
                <span>{member.username}</span>
                <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
              </MemberItem>
            ))}
          </MembersList>
        </ModalBody>
        <ModalFooter>
          <button onClick={onClose}>Close</button>
        </ModalFooter>
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
