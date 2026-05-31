import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import MyRegistrations from './pages/MyRegistrations'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Protected — organizer & admin */}
        <Route element={<ProtectedRoute roles={['organizer', 'admin']} />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Route>

        {/* Protected — admin only */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
