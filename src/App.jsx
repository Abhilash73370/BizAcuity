import { useState, useRef, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import WallEditor from './pages/WallEditor'
import Landing from './pages/Landing'
import User from './pages/User'
import './index.css'
import { Upload, Settings, Palette, Image as LucideImage, Ruler, Trash2, Download, X } from 'lucide-react'

export const UserContext = createContext();

function App() {
  const [registeredUser, setRegisteredUser] = useState(null);
  return (
    <UserContext.Provider value={{ registeredUser, setRegisteredUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wall" element={<WallEditor />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  )
}

export default App