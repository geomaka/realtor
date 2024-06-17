import React from 'react'
import { Link, useParams } from 'react-router-dom'

function TenantHeader() {
    let {tenantID} = useParams()
  return (
    <header className='bg-blue-500 shaodw-md'>
        <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
            <Link to={'/'}>
        <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-black'>Realtor</span>
        </h1>
        </Link>
        <ul className='flex gap-4'>
            <Link to={`/${tenantID}/my-account`}>
            <li className='hidden sm:inline text-slate-700 hover:underline'>My account</li>
            </Link>
        </ul>
        </div>
    </header>
  )
}

export default TenantHeader