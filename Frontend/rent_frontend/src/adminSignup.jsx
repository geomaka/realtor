import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

function AdminSignupForm() {
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // const [property, setProperty] = useState('')
  const navigate = useNavigate()
  // const [csrfToken, setCsrfToken] = useState('');

  // useEffect(() => {
  //     const fetchCsrf = async () =>{
  //       try {
  //         const response = await fetch('http://localhost:8000/rent/adminsignup/csrf');
  //         const data = await response.json();
  //         console.log(data); // Log response data
  //         setCsrfToken(data.csrfToken);
  //       } catch (error) {
  //         console.error('Error fetching CSRF token:', error);
  //       }
  //     }


  //   fetchCsrf()

  //   },[]);


  const createUser = (e) => {
    e.preventDefault();
    // const propertyData = {property}
    const data = {
      first_name,
      last_name,
      phone,
      email,
      password
    }


    fetch('http://localhost:8000/rent/adminsignup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
        // 'X-CSRFToken': csrfToken 
      }
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        let id = data.landlord_id
        navigate(`/${id}/utilities`)
        console.log(id)
      })
      .catch(error => {
        console.log(error)
      })
  }

  return (
    <>
     <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
     <div className="md:w-1/3 max-w-sm">
          <img
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="Sample image"
          />
        </div>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-xs">
        <h1 className="m-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">Landlord sign-in</h1>
          <form action="">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                First name
              </label>
              <input
                type="text"
                value={first_name}
                required
                onChange={(e) => { setFirst(e.target.value) }}
                name='first_name'
                placeholder='Enter first name'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Last name
              </label>
              <input
                type="text"
                value={last_name}
                required
                onChange={(e) => { setLast(e.target.value) }}
                name='last_name'
                placeholder='Enter lastname'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Phone no.
              </label>
              <input
                type="text"
                value={phone}
                required
                onChange={(e) => { setPhone(e.target.value) }}
                name='phone'
                placeholder='Enter phone number'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Email
              </label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => { setEmail(e.target.value) }}
                name='email'
                placeholder='email'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Password
              </label>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => { setPassword(e.target.value) }}
                name="password"
                placeholder='password'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center justify-between">
              <input type="submit" onClick={createUser} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" value="Sign in" />
            </div>
          </form>
        </div>
      </div>
      </section>
    </>
  )
}

export default AdminSignupForm;
