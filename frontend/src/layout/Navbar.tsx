import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='bg-theme-blue w-full h-20 flex flex-row justify-between items-center gap-4 px-10'>
        <Link to={'/'} className='w-48'><img src='/Con8Ted.png'/></Link>
        
        <div className="flex justify-between items-center gap-8">
            <Link to={'#'} className='text-white text-xl font-bold hover:scale-105'>About</Link>
            <Link to={'#'} className='text-white text-xl font-bold hover:scale-105'>Contact</Link>
            <Link to={'#'} className='text-white text-xl font-bold hover:scale-105'>Services</Link>
            <Link to={'#'} className='text-white text-xl font-bold hover:scale-105'>Help</Link>
        </div>
    </div>
  )
}

export default Navbar