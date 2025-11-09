// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [msg, setMsg] = useState('');
//   const API = import.meta.env.VITE_API_URL;

//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMsg('');
//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `${API}/api/auth/forgot-password`
// ,
//         { email },
//         { withCredentials: true }
//       );
//       setMsg(res.data.message || 'If your email exists, a reset link was sent.');
//       // For dev only: you may show the link returned by backend (avoid in prod)
//       // navigate('/'); or keep on page
//     } catch (err) {
//       setMsg(err.response?.data?.message || 'Error sending reset link');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="forgot-password-page">
//       <h2>Reset password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Enter your account email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? 'Sending...' : 'Send reset link'}
//         </button>
//       </form>
//       {msg && <p>{msg}</p>}
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState } from "react";
import axios from "axios";
import './auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Error sending reset link");
    }
  };

  return (
    <div className="forgot-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Link</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ForgotPassword;
