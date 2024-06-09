import React, { useContext } from 'react'
import Navbar from './layout/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'

const App = () => {
  // const {joinedStatus,setJoinedStatus}=useJoined();
  return (
    <div>
        <Navbar/>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/caller' element={<h1>Caller</h1>} />
            <Route path='/receiver' element={<h1>Receiver</h1>} />
        </Routes>
    </div>
  )
}

export default App