import React, { useContext } from 'react'
import Navbar from './layout/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Caller from './components/Caller'
import Receiver from './components/Receiver'


const App = () => {
  // const {joinedStatus,setJoinedStatus}=useJoined();
  return (
    <div>
        <Navbar/>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/caller/:roomcode' element={<Caller/>} />
            <Route path='/receiver/:roomcode' element={<Receiver/>} />
        </Routes>
    </div>
  )
}

export default App