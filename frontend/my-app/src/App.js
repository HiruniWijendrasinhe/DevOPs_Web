import Login from './Login';
import SignUp from './SignUp';
import CreateIncident from './CreateIncident';
import Progress from './Progress';
import ContactUs from './ContactUs';
import Footer from './Footer';
import Header from './Header';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import ProtectedRoute from './ProtectedRoute';
import UserManagement from './UserManagement';
import AdminDashboard from './AdminDashboard';
function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
 const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  return (
    <Router>
      <Header/>



      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home userRole={userRole} setUserRole={setUserRole} />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/incidents" element={<CreateIncident />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/users" element={<UserManagement />} /> 
         <Route path="/admin/dashboard" element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

      </Routes>




      <Footer />
    </Router>
  );
}

export default App;
