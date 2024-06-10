import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";

function Login() {
    const location = useLocation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { loggedOut, message } = location.state || {};

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()

        let data_to_be_posted = {
            email,
            password
        }

        fetch("http://localhost:8000/rent/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data_to_be_posted)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.role == 'landlord') {
                    let id = data.landlordID
                    navigate(`/${id}/tenants`)
                } else {
                    let id = data.tenantID
                    navigate(`/${id}`)
                }
                console.log(data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    return (
        <>
            <div className="flex justify-center items-center h-screen">
                <div className="w-full max-w-xs">
                {loggedOut && message && <div className="mb-4 text-green-500">{message}</div>}
                    <h1 className="text-center mb-4">Login</h1>
                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            {!password && (
                                <p className="text-red-500 text-xs italic">Please choose a password.</p>
                            )}
                            <div className="flex items-center justify-between">
                                <input type="submit" value="Log in" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" />
                                <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                                    Forgot Password?
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Login;