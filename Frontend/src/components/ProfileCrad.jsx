// import React, { useEffect, useState } from "react";
// import "./ProfileCard.css";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const ProfileCard = () => {
//   const [user, setUser] = useState(null); // store user data from backend
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get("https://chatgpt-iet7.onrender.com/api/auth/me", {
//           withCredentials: true, // sends cookie to backend
//         });
//         setUser(res.data); // store data in state
//         console.log(res);
//       } catch (err) {
//         console.error("Error fetching user:", err);
//       }
//     };

//     fetchUser();
//   }, []);

//   if (!user) {
//     return <div className="profile-card">Loading user info...</div>;
//   }

//   // default avatar (if you don't have one from backend)
//   const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className="profile-card">
//       <img
//         src={user.avatar || defaultAvatar}
//         alt="Profile"
//         className="profile-avatar"
//       />
//       <h2 className="profile-name">{user.fullName || "User"}</h2>
//       <p className="profile-email">{user.email}</p>
      

//       <button className="edit-btn" onClick={() => navigate("/")}>
//         Go to Home Page
//       </button>
//     </div>
//   );
// };

// export default ProfileCard;


import React, { useEffect, useState } from "react";
import "./ProfileCard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // install this if not already: npm install js-cookie

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://chatgpt-iet7.onrender.com/api/auth/me",
          { withCredentials: true }
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear frontend auth info
      Cookies.remove("token"); // or whatever cookie name your backend uses
      localStorage.clear();
      sessionStorage.clear();

      // Optional: you can also inform backend if you want later

      // Redirect user
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Something went wrong while logging out.");
    }
  };

  if (!user) {
    return <div className="profile-card">Loading user info...</div>;
  }

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default ProfileCard;
