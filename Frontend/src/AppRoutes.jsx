import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {useParams} from 'react-router-dom'
import React from 'react'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import ChatPage from '../src/components/ChatPage'
import Settings from './pages/Settings'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'

const AppRoutes = () => {
    return (

        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path="/chat/:chatId" element={<ChatPageWrapper />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

            </Routes>
        </BrowserRouter>
    )
}
function ChatPageWrapper() {
  const { chatId } = useParams();
  return <ChatPage key={chatId} />;
}

export default AppRoutes;