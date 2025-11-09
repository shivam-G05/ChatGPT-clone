// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const { token } = useParams();
//   const [password, setPassword] = useState('');
//   const [confirm, setConfirm] = useState('');
//   const [msg, setMsg] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const API = import.meta.env.VITE_API_URL;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (password !== confirm) {
//       setMsg('Passwords do not match');
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `${API}/api/auth/forgot-password`
// ,
//         { password }
//       );
//       setMsg(res.data.message || 'Password updated');
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setMsg(err.response?.data?.message || 'Reset failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="reset-password-page">
//       <h2>Create new password</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
//         <input type="password" placeholder="Confirm password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required/>
//         <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
//       </form>
//       {msg && <p>{msg}</p>}
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Error resetting password");
    }
  };

  return (
    <div className="reset-container">
      <h2>Create New Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ResetPassword;

