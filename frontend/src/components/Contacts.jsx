import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { MdGroupAdd, MdSettings, MdMoreVert, MdBlock } from "react-icons/md";
import DefaultProfilePic from "../assets/profileicon.png";
import DefaultGroupPic from "../assets/DefaultGroupPic.jpeg";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, removeContacts, reportAndRemoveContact } from "../store/slices/user-slice";
import GroupModal from "./GroupModal";
import GroupSettingsModal from "./GroupSettingsModal";
import ReportDialog from "./ReportDialog"; // Import the new component

export default function Contacts({ contacts, groups, changeChat }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [currentSelectedGroup, setCurrentSelectedGroup] = useState(undefined);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [contactToBlock, setContactToBlock] = useState(null);
  const curUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  useEffect(() => {
    dispatch(getUserData());
  }, []);

  useEffect(() => {
    // Add event listener for clicks outside the menu
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    }

    // Attach the listener to the document
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the listener when component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Open group settings for a specific group
  const openGroupSettings = (group) => {
    setSelectedGroup(group);
    setShowGroupSettingsModal(true);
  };

  // Change the current chat (individual or group)
  const changeCurrentChat = (index, chat, isGroup) => {
    if(isGroup){
      setCurrentSelectedGroup(index);
      setCurrentSelected(undefined);
    }
    else {
      setCurrentSelected(index);
      setCurrentSelectedGroup(undefined);
    }
    changeChat(chat, isGroup);
  };

  // Handle block button click
  const handleBlockClick = (e, contact) => {
    e.stopPropagation();
    setContactToBlock(contact);
    setShowReportDialog(true);
    setMenuOpen(null);
  };

  // Just block without reporting
  const handleBlockOnly = () => {
    if (contactToBlock) {
      dispatch(removeContacts({...contactToBlock}));
      setContactToBlock(null);
    }
  };

  // Report and block
  const handleReportAndBlock = (reason) => {
    if (contactToBlock) {
      dispatch(reportAndRemoveContact({ id: contactToBlock.id, reason: reason }));
      setContactToBlock(null);
    }
  };

  return (
    <Container>
      <div className="title">
        <h2>Chats</h2>
        {(curUser?.phone_verified || curUser?.email_verified) && <button className="create-group-btn" onClick={() => setShowGroupModal(true)}>
          <MdGroupAdd />
        </button>}
      </div>

      {/* Group Modal */}
      {(curUser?.phone_verified || curUser?.email_verified) && showGroupModal && (
        <GroupModal
          contacts={contacts}
          onClose={() => setShowGroupModal(false)}
        />
      )}

      {/* Group Settings Modal */}
      {(curUser?.phone_verified || curUser?.email_verified) && showGroupSettingsModal && (
        <GroupSettingsModal
          group={selectedGroup}
          contacts={contacts}
          onClose={() => setShowGroupSettingsModal(false)}
        />
      )}

      {/* Report Dialog */}
      <ReportDialog 
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onBlock={handleBlockOnly}
        onReportAndBlock={handleReportAndBlock}
      />

      {/* Contacts and Groups List */}
      <div className="contacts">
        {/* Groups */}
        {groups.map((group, index) => (
          <div
            key={group.id}
            className={`contact ${
              index === currentSelectedGroup ? "selected" : ""
            }`}
            onClick={() => changeCurrentChat(index, group, true)}
          >
            <div className="avatar">
              <img src={DefaultGroupPic} alt="" />
            </div>
            <div className="username">
              <h3>{group.name}</h3>
            </div>
            {(curUser?.phone_verified || curUser?.email_verified) && group?.admin_username === curUser.username && 
              <button 
                className="settings-btn" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the changeCurrentChat
                  openGroupSettings(group);
                }}
              >
                <MdSettings />
              </button>
            }  
          </div>
        ))}

        {/* Individual Contacts */}
        {contacts && contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <div
              key={contact.id}
              className={`contact ${index === currentSelected ? "selected" : ""}`}
              onClick={() => changeCurrentChat(index, contact, false)}
            >
              <div className="avatar">
                <img src={contact?.profile_pic ? contact.profile_pic : DefaultProfilePic} alt="" />
                <div className="status online"></div>
              </div>
              <div className="username">
                <h3>{contact.username}</h3>
                <p className="last-message">Click to start chatting</p>
              </div>
              <div className="contact-menu" ref={menuOpen === contact.id ? menuRef : null}>
                <button 
                  className="menu-btn" 
                  onClick={(e) => handleBlockClick(e, contact)}
                >
                  <MdBlock />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-contacts">
            <p>No contacts yet. Start by adding friends!</p>
          </div>
        )}
      </div>

      {/* Current User */}
      <div className="current-user">
        <div className="avatar">
          <img src={DefaultProfilePic} alt="avatar" />
          <div className="status online"></div>
        </div>
        <div className="username">
          <h2>{curUser && curUser.username ? curUser.username : "Loading..."}</h2>
          <p>Online</p>
        </div>
      </div>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: auto 1fr auto;
  background: linear-gradient(145deg, #101035 0%, #0a0a25 100%);
  border-radius: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  .title {
    padding: 1.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(90deg, rgba(15, 15, 50, 0.7) 0%, rgba(20, 20, 60, 0.7) 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      color: #b69fff;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
    }

    .create-group-btn {
      background: #5d8bfc;
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        background: #4a78e8;
      }
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    gap: 0.8rem;
    padding: 1rem 0.8rem;
    background-color: rgba(10, 10, 35, 0.4);

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #9a86f3 0%, #7d6bd4 100%);
      border-radius: 10px;

      &:hover {
        background: linear-gradient(180deg, #b69fff 0%, #9a86f3 100%);
      }
    }

    .no-contacts {
      color: #d5d5f6;
      text-align: center;
      margin: 2rem 0;
      padding: 1.2rem;
      border: 1px dashed rgba(182, 159, 255, 0.4);
      background-color: rgba(154, 134, 243, 0.06);
      border-radius: 8px;
      width: 85%;
    }

    .contact {
      width: 95%;
      min-height: 5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem 1rem;
      background: linear-gradient(120deg, rgba(25, 25, 60, 0.4) 0%, rgba(20, 20, 55, 0.4) 100%);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      border: 1px solid rgba(154, 134, 243, 0.1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

      &:hover {
        background: linear-gradient(120deg, rgba(40, 40, 85, 0.5) 0%, rgba(45, 45, 90, 0.5) 100%);
        transform: translateY(-2px);
        border: 1px solid rgba(182, 159, 255, 0.4);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .avatar {
        position: relative;

        img {
          height: 3.2rem;
          width: 3.2rem;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(154, 134, 243, 0.2);
          transition: all 0.2s ease;
          background-color: #151540;
        }

        .status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #101035;

          &.online {
            background: linear-gradient(135deg, #56d364 0%, #44b700 100%);
            box-shadow: 0 0 5px rgba(68, 183, 0, 0.6);
          }

          &.offline {
            background-color: #a0a0a0;
          }
        }
      }

      .username {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        flex: 1;

        h3 {
          color: #e8e8ff;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .last-message {
          color: #b4b4d5;
          font-size: 0.8rem;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
      }

      .settings-btn {
        background: transparent;
        border: none;
        color: #b4b4d5;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.2s ease;

        &:hover {
          color: #ffffff;
          background-color: rgba(154, 134, 243, 0.2);
        }
      }
      
      .contact-menu {
        position: relative;
        margin-left: auto;
        z-index: 100;

        .menu-btn {
          background: none;
          border: none;
          color: #b4b4d5;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
          
          &:hover {
            color: #ffffff;
          }
        }
      }
    }

    .selected {
      background: linear-gradient(120deg, rgba(90, 70, 190, 0.35) 0%, rgba(75, 60, 170, 0.35) 100%);
      border: 1px solid rgba(182, 159, 255, 0.6);
      box-shadow: 0 3px 10px rgba(154, 134, 243, 0.2);

      .avatar img {
        border-color: #b69fff;
      }

      &:hover {
        background: linear-gradient(120deg, rgba(100, 80, 200, 0.4) 0%, rgba(85, 70, 180, 0.4) 100%);
      }

      .username h3 {
        color: #ffffff;
      }
    }
  }

  .current-user {
    background: linear-gradient(90deg, rgba(15, 15, 45, 0.95) 0%, rgba(20, 20, 60, 0.95) 100%);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem 1.5rem;
    gap: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

    .avatar {
      position: relative;

      img {
        height: 3.5rem;
        width: 3.5rem;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #b69fff;
        box-shadow: 0 0 10px rgba(182, 159, 255, 0.3);
        background-color: #151540;
      }

      .status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #0f0f2d;

        &.online {
          background: linear-gradient(135deg, #56d364 0%, #44b700 100%);
          box-shadow: 0 0 5px rgba(68, 183, 0, 0.6);
        }
      }
    }

    .username {
      display: flex;
      flex-direction: column;

      h2 {
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      p {
        color: #56d364;
        font-size: 0.8rem;
        margin: 0.2rem 0 0 0;
        font-weight: 500;
      }
    }

    @media screen and (max-width: 1080px) {
      gap: 0.5rem;
      padding: 0.8rem 1rem;

      .avatar img {
        height: 2.8rem;
        width: 2.8rem;
      }
      
      .username h2 {
        font-size: 0.9rem;
      }
    }
  }
`;