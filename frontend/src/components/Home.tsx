import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Home = () => {
  const [roomCode,setRoomCode]=useState<string>('');
  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-theme-blue to-indigo-600/80 flex flex-row gap-10 items-center justify-between px-10'>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      {/* Left */}
      <div className="w-[60%] flex flex-col gap-8  justify-center z-20">
        <h1 className="text-8xl font-bold text-white tracking-wider">Welcome to, Con8Ted</h1>
        <p className="text-white text-xl leading-10 gap-x-80 tracking-widest">Enjoy real time calls for absolutely free. Con8Ted is a free, open-source webRTC project.</p>
      </div>

      {/* Right */}
      <form className='z-20 bg-white w-[40%] h-[60%] rounded-2xl shadow-white shadow-md p-10 flex-col gap-4'>
        <div className="flex flex-col gap-4">
          <label htmlFor="" className='text-lg font-bold text-gray-700'>Room Code</label>
          <input type="text" value={roomCode} onChange={(e)=>setRoomCode(e.target.value)} className='border border-gray-800 text-gray-900 rounded-lg block w-full p-2.5  focus:ring-blue-500 focus:border-blue-500 text-xl' placeholder='Enter Room Code' />
        </div>

        <div className="flex w-full mt-8">
          <Link to={roomCode?'/receiver':'/caller'} className='px-3 py-2 w-full rounded-md text-xl text-center
           bg-theme-blue text-white'>{roomCode?'Join Room':'Start Call'}</Link>
        </div>
      </form>

    </div>
  )
}

export default Home