// import React from "react";
// import {useEffect} from 'react';
// import "./ProfileCard.css";
// import {useNavigate} from 'react-router-dom'
// import axios from "axios";
// const ProfileCard = () => {

//     useEffect(() => {
//     const fetchUser = async () => {
//     try {
//       const res = await axios.get("https://chatgpt-my1m.onrender.com/api/auth/me", {
//         withCredentials: true, 
//       });
//       console.log(res.data); 
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   fetchUser();
// }, []);
//     const navigate=useNavigate();
//   const user = {
//     name: "Shivam Goel",
//     email: "shivam@example.com",
//     avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//     joined: "March 2024",
//   };

//   return (
//     <div className="profile-card">
//       <img src={user.avatar} alt="Profile" className="profile-avatar" />
//       <h2 className="profile-name">{user.name}</h2>
//       <p className="profile-email">{user.email}</p>
//       <p className="profile-joined">Joined: {user.joined}</p>

//       <button className="edit-btn" onClick={()=>{navigate('/')}}>Go to Home Page</button>
//     </div>
//   );
// };

// export default ProfileCard;

import React, { useEffect, useState } from "react";
import "./ProfileCard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileCard = () => {
  const [user, setUser] = useState(null); // store user data from backend
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://chatgpt-my1m.onrender.com/api/auth/me", {
          withCredentials: true, // sends cookie to backend
        });
        setUser(res.data); // store data in state
        console.log(res);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="profile-card">Loading user info...</div>;
  }

  // default avatar (if you don't have one from backend)
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="profile-card">
      <img
        src={user.avatar || defaultAvatar}
        alt="Profile"
        className="profile-avatar"
      />
      <h2 className="profile-name">{user.fullName || "User"}</h2>
      <p className="profile-email">{user.email}</p>
      

      <button className="edit-btn" onClick={() => navigate("/")}>
        Go to Home Page
      </button>
    </div>
  );
};

export default ProfileCard;
