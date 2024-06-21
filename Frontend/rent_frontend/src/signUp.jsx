import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Components/footer";

function SignUp() {
  const [landlords, setLandlords] = useState([])
  const [house_number, setHouse] = useState('')
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [phone, setPhone] = useState('')
  const [date_moved_in, setDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  
  const fetchLandlords = async () => {
    let response = await fetch("http://localhost:8000/rent/signup")
    let data = await response.json()
    setLandlords(data.landlords)
    console.log(data)
  }

  useEffect(() => {
    fetchLandlords()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    let dataToBePosted = {
      landlord_id: landlords.length > 0 ? landlords[0].id : null,
      first_name,
      last_name,
      phone,
      email,
      password,
      house_number,
      date_moved_in
    }

    fetch("http://localhost:8000/rent/signup", {
      method: "POST",
      body: JSON.stringify(dataToBePosted),
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => res.json())
      .then((data) => {
        let id = data.tenant.house_number
        console.log(id)
        navigate(`/${id}`)
        console.log(data)
      })
      .catch((error) => {
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
            <h1 className="m-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">Tenant sign-in</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  House Number
                </label>
                <input
                  type="text"
                  value={house_number}
                  required
                  onChange={(e) => setHouse(e.target.value)}
                  name="house_number"
                  placeholder="Enter the house number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  First name
                </label>
                <input
                  type="text"
                  value={first_name}
                  required
                  onChange={(e) => setFirst(e.target.value)}
                  name="first_name"
                  placeholder="Enter first name"
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
                  onChange={(e) => setLast(e.target.value)}
                  name="last_name"
                  placeholder="Enter last name"
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
                  onChange={(e) => setPhone(e.target.value)}
                  name="phone"
                  placeholder="Enter phone"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Date moved in
                </label>
                <input
                  type="date"
                  value={date_moved_in}
                  required
                  onChange={(e) => setDate(e.target.value)}
                  name="date_moved_in"
                  placeholder="Enter Date moved in"
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
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  placeholder="Enter email"
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
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  placeholder="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div className="mb-6">
                <select name="landlord_id" className="rounded focus:outline-none focus:shadow-outline">
                  {landlords.map(landlord => (
                    <option key={landlord.id} value={landlord.id}>{landlord.first_name} {landlord.last_name}</option>
                  ))}
                </select>
              </div >
              <div className="flex items-center justify-between" >
                <input type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" value="Sign in" />
              </div>
            </form>
          </div>
        </div>
      </section>
      < Footer />
    </>
  )

}

export default SignUp;