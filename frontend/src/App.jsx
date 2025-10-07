import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MyVehicles from './pages/MyVehicles.jsx'
import Tracking from './pages/Tracking.jsx'
import Booking from './pages/Booking.jsx'
import Profile from './pages/Profile.jsx'
import PersonalProfile from './pages/PersonalProfile.jsx'
import Payment from './pages/Payment.jsx'
import Technician from './pages/Technician.jsx'
import Staff from './pages/Staff.jsx'
import Admin from './pages/Admin.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout />}> 
          <Route path="/vehicles" element={<MyVehicles />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/personal-profile" element={<PersonalProfile />} />
          <Route path="/payment" element={<Payment />} />
        <Route path="/technician" element={<Technician />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
