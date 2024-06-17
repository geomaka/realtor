import React from 'react'
import {FaSearch} from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'

function Header() {
    let {landlordID} = useParams()
  return (
    <header className='bg-blue-500 shaodw-md'>
        <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
            <Link to={'/'}>
        <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-black'>Realtor</span>
        </h1>
        </Link>
        {/* <form className='bg-slate-100 p-3 rounded-lg flex flex-center'>
            <input type="text" placeholder='search...' 
            className='bg-transparent focus:outline-none w-24 sm:w-64' />
            <FaSearch className='text-slate-600 '/>
        </form> */}
        <ul className='flex gap-4'>
            <Link to={`/${landlordID}/payments-received`}>
            <li className='hidden sm:inline text-slate-700 hover:underline'>Payments</li>
            </Link>
            <Link to={`/${landlordID}/account`}>
            <li className='hidden sm:inline text-slate-700 hover:underline'>My account</li>
            </Link>
        </ul>
        </div>
    </header>
  )
}

export default Header