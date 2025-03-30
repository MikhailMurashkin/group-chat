import {Routes, Route} from 'react-router-dom'
import { AuthProvider } from './modules/AuthContext'
import PrivateRoute from './modules/PrivateRoute'
import './style/App.css'
import './style/index.css'

import Blank from './Blank'
import Login from './Login'
import Register from './Register'
import Groups from './Groups'
import Group from './Group'
import Chat from './Chat'
import 'bootstrap/dist/css/bootstrap.min.css'


const App = () => {

  return (
    <AuthProvider>
      <Routes>
          <Route path="/" element={<Blank />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
          <Route path="/group/:groupId" element={<PrivateRoute><Group /></PrivateRoute>} />
          <Route path="/group/:groupId/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          {/* <Route path="/rooms" element={<PrivateRoute><RoomList /></PrivateRoute>} />
          <Route path="/create-room" element={<PrivateRoute><CreateRoom /></PrivateRoute>} />
          <Route path="/join-room" element={<PrivateRoute><JoinRoom /></PrivateRoute>} />
          <Route path="/room/:roomId/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} /> */}
      </Routes>
    </AuthProvider>
  );
};

export default App
