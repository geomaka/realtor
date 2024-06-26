import React from "react"
import { Link } from "react-router-dom"
import Building from '../public/pexels-rickyrecap-2556001.svg'
import Footer from "./Components/footer"
import Navbar from "./Components/homeBar"

function HomePage() {
    return (
        <>
        < Navbar/>
            <div className='w-screen h-[calc(100vh-5rem)]'>
                <div className="bg-cover bg-[url('/public/pexels-rickyrecap-2556001.svg')] bg-center bg-no-repeat h-full w-full" >
                    <div className="container mx-auto flex flex-col my-auto align-middle h-full" >
                        <div className='my-auto  mx-auto lg:mx-0 w-10/12 lg:w-2/5'>
                            <h1 className="text-7xl mb-4 text-white"><span className='text-blue-500'>Welcome</span> to realtor</h1>
                            <p className="text-2xl mb-8 text-white">Manage your houses and tenants in one place</p>
                            <div className='flex items-center'>
                                <Link to={'/admin-signup'}>
                                    <button className='rounded px-10 py-3 text-white bg-blue-500 hover:bg-blue-600 m-4'>
                                        I'm a landlord</button>
                                </Link>
                                {/* <img className='w-screen h-screen pl-4 pr-2' src={Building} /> */}
                                <Link to={'/signup'} className="inline-block align-baseline font-bold text-bg text-white hover:text-blue-800 mb-2">I'm a tenant</Link>
                            </div>
                        </div>
                    </div >
                </div >
            </div>
            <div className="flex items-center justify-center w-screen bg-gray-100 overflow-hidden m-0">
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
  <div className="flex flex-col items-center h-full max-w-2xl px-4 py-8">
    <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">
      About us
    </h1>
    <p className="mb-0 mt-2 text-center text-black dark:text-black">
      Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools, so your IT support and operations teams have richer contextual information to rapidly respond to requests, incidents, and changes.
    </p>
  </div>
  <div className="flex flex-col items-center -full max-w-2xl px-4 py-8">
    <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">
      Contact us
    </h1>
    <div className="mt-4 text-center">
      <p className="text-lg text-gray-800 dark:text-black">123 Main Street, Suite 101</p>
      <p className="text-lg text-gray-800 dark:text-black">City, State, ZIP Code</p>
      <p className="text-lg text-gray-800 dark:text-black">Phone: (123) 456-7890</p>
      <p className="text-lg text-gray-800 dark:text-black">Email: contact@yourcompany.com</p>
    </div>
    <div className="mt-4 text-center">
      <p className="text-lg font-bold text-gray-800 dark:text-black">Business Hours:</p>
      <p className="text-lg text-gray-800 dark:text-black">Monday - Friday: 9:00 AM - 6:00 PM</p>
      <p className="text-lg text-gray-800 dark:text-black">Saturday: 10:00 AM - 4:00 PM</p>
      <p className="text-lg text-gray-800 dark:text-black">Sunday: Closed</p>
    </div>
  </div>
</div>

                
            </div>
            < Footer/>
        </>
    )
}

export default HomePage