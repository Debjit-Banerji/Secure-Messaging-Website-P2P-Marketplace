import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash, FaTimes } from "react-icons/fa";
import { updateExistingUser } from "../store/slices/user-slice";
import DefaultProfilePic from "../assets/profileicon.png";

export default function ProfilePage() {

  const dispatch = useDispatch();

  const [profilePicture, setProfilePicture] = useState("");

  const [isEditable, setIsEditable] = useState({
    username: false,
    email: false,
    contactno: false,
    password: false,
  });

  // const currentUser = useSelector((state) => state.user.selectedUser);

  // Temporary state to hold changes
  const [temp, setTemp] = useState(
    {username: "",
    email: "",
    contactno: "",
    password: "",}
  );

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    // if (isEditable[field] === false) {
    //   setTemp((prev) => ({
    //     ...prev,
    //     [field]: currentUser[field],
    //   }));
    // }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (field) => {
    // if (field === "name" || field === "email" || field === "gptkey") {
    //   console.log(currentUser);
    //   console.log(temp);
    //   dispatch(updateExistingUser({ email: currentUser.email, userData: temp })); // Dispatching action to update user data
    // }
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleDiscardChanges = (field) => {
    // setTemp((prev) => ({
    //   ...prev,
    //   [field]: currentUser[field],
    // }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const navigate = useNavigate();

  const handleCloseClick = () => {
    navigate("/");
  };

  return (
    <ProfileContainer>
      <div className="close"><FaTimes onClick={handleCloseClick} /></div>
      <h2>Profile</h2>
      <div className="profile-section">
        <div className="profile-picture-container">
          <img
            src={profilePicture || DefaultProfilePic}
            alt="Profile"
            className="profile-picture"
          />
          <label className="edit-icon">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: "none" }}
            />
            <FaPen />
          </label>
        </div>
      </div>
      <hr />
      <div className="form-section">
        <div className="form-grid">
          {[
            {
              label: "Username",
              value: temp.username,
              setValue: (value) => setTemp((prev) => ({ ...prev, username: value })),
              field: "username",
            },
            {
              label: "Email",
              value: temp.email,
              setValue: (value) => setTemp((prev) => ({ ...prev, email: value })),
              field: "email",
            },
            {
              label: "Contact Number",
              value: temp.gptkey,
              setValue: (value) => setTemp((prev) => ({ ...prev, contactno: value })),
              field: "contactno",
            },
            {
              label: "Password",
              value: temp.password,
              setValue: (value) => setTemp((prev) => ({ ...prev, password: value })),
              field: "password",
            },
          ].map(({ label, value, setValue, field }) => (
            <div key={field} className="form-group">
              <label>{label}</label>
              <input
                type={field === "password" ? "password" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditable[field]}
              />
              <div className="icons">
                {!isEditable[field] ? (
                  <div
                    className="edit-icon"
                    onClick={() => handleEditToggle(field)}
                  >
                    <FaPen />
                  </div>
                ) : (
                  <>
                    <div
                      className="save-icon"
                      onClick={() => handleSaveChanges(field)}
                    >
                      <FaCheck />
                    </div>
                    <div
                      className="delete-icon"
                      onClick={() => handleDiscardChanges(field)}
                    >
                      <FaTrash />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProfileContainer>
  );
}

// Styled Component
const ProfileContainer = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 2rem;
  background-color: #1a1a5a; /* Dark blue background */
  color: white; /* White text for better contrast */

  .close{
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
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
  }

  h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 2rem;
    color: white;
  }

  .profile-section {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;

    .profile-picture-container {
      position: relative;
      width: 150px;
      height: 150px;

      .profile-picture {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid white;
        object-fit: cover;
      }

      .edit-icon {
        position: absolute;
        bottom: 5px;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: #007bff; /* Blue background */
        border: 2px solid white;
        border-radius: 50%;
        color: white;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #0056b3; /* Darker blue */
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }
      }
    }
  }

  hr {
    width: 80vw;
    margin: 2rem auto;
    border: none;
    border-top: 1px solid white;
  }

  .form-section {
    display: flex;
    justify-content: center;

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 80%;

      .form-group {
        position: relative;

        label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: white;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border-radius: 5px;
          outline: none;
          background-color:rgb(153, 141, 243);
          color: black;
          cursor: not-allowed;

          &:not(:disabled) {
            background-color:rgb(178, 180, 216);
            border: 2px solid #007bff;
            cursor: text;
          }
        }

        .icons {
          position: absolute;
          top: 70%;
          right: -20px;
          transform: translateY(-50%);
          display: flex;
          gap: 0.5rem;

          .edit-icon {
            background: #007bff;
            color: white;
            width: 30px;
            height: 30px;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: #0056b3; /* Darker blue */
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
              transform: scale(1.1);
            }
          }
          
          .save-icon {
            background: #28a745;
            color: white;
            width: 30px;
            height: 30px;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: #1e7e34;
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
              transform: scale(1.1);
            }
          }
          
          .delete-icon {
            background: #dc3545;
            color: white;
            width: 30px;
            height: 30px;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: #a71d2a;
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }
`;
