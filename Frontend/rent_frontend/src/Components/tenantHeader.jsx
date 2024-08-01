import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'

function TenantHeader() {
    let { tenantID, propertyID } = useParams()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <header className='bg-blue-500 shadow-md'>
            <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
                <Link to={'#'}>
                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <span className='text-black'>Rent_Ease</span>
                    </h1>
                </Link>
                <div className='relative'>
                    <button
                        className='sm:hidden text-slate-700 focus:outline-none'
                        onClick={toggleDropdown}
                    >
                        <FaBars size={24} />
                    </button>
                    <ul className={`sm:flex sm:gap-4 ${isDropdownOpen ? 'block' : 'hidden'} sm:block absolute sm:static top-12 right-0 sm:top-auto sm:right-auto bg-white sm:bg-transparent text-center sm:text-left shadow-lg rounded-lg sm:shadow-none sm:rounded-none`}>
                        {/* <Link to={`/${tenantID}/${propertyID}/utilities`} className='block sm:inline text-slate-700 hover:underline p-2 sm:p-0'>
                            <li>Utilities</li>
                        </Link> */}
                        <Link to={`/${tenantID}/my-account`} className='block sm:inline text-slate-700 hover:underline p-2 sm:p-0'>
                            <li>Account</li>
                        </Link>
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default TenantHeader
