import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { TEInput, TERipple } from "tw-elements-react";
import Footer from "./Components/footer";

function Login() {
    const location = useLocation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { loggedOut, message } = location.state || {};
    const [localMessage, setLocalMessage] = useState(message);
    const [localLoggedOut, setLocalLoggedOut] = useState(loggedOut);

    useEffect(() => {
        if (message) {
            setLocalMessage(message);
        }
        if (loggedOut !== undefined) {
            setLocalLoggedOut(loggedOut);
        }
    }, [message, loggedOut]);


    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        let data_to_be_posted = {
            email,
            password
        }

        fetch("https://realtor-1-kllo.onrender.com/rent/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data_to_be_posted)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'success') {
                    localStorage.setItem('accessToken', data.access);
                }
                if (data.role == 'landlord') {
                    let id = data.landlordID
                    navigate(`/${id}/tenants`);
                } else if (data.role == "tenant") {
                    let id = data.tenantID
                    let propertyID = data.propertyID
                    navigate(`/${id}/${propertyID}`);
                }
                else{
                    setError(data.error)
                }
                console.log(data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    return (
        <>
            <section className="h-screen flex items-center justify-center">
                <div className="container max-w-screen-md px-6 py-12 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            {localLoggedOut && localMessage && (
                                <div className="mb-4 text-green-500">
                                    {localMessage}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 text-red-500">
                                    {error}
                                </div>
                            )}
                            <h1 className="m-4 text-3xl md:text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-blue-500">Log-in</h1>
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
                                        <Link to={'/login/forgot-password'} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                                        <p className="mx-4 mb-0 text-center font-semibold dark:text-neutral-200">
                                            OR
                                        </p>
                                    </div>
                                    <TERipple rippleColor="light" className="w-full">
                                        <Link to={'/'}
                                            className="mb-3 flex w-full items-center justify-center rounded bg-info px-7 pb-2.5 pt-3 text-center text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#54b4d3] transition duration-150 ease-in-out hover:bg-info-600 hover:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.3),0_4px_18px_0_rgba(84,180,211,0.2)] focus:bg-info-600 focus:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.3),0_4px_18px_0_rgba(84,180,211,0.2)] focus:outline-none focus:ring-0 active:bg-info-700 active:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.3),0_4px_18px_0_rgba(84,180,211,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(84,180,211,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.2),0_4px_18px_0_rgba(84,180,211,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.2),0_4px_18px_0_rgba(84,180,211,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(84,180,211,0.2),0_4px_18px_0_rgba(84,180,211,0.1)]"
                                            style={{ backgroundColor: "#55acee" }}
                                            href="#!"
                                            role="button"
                                        >
                                            Create an account
                                        </Link>
                                    </TERipple>
                                </div>
                            </form>
                        </div>
                        <div className="hidden md:block">
                            <img
                                src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                                className="w-full"
                                alt="Phone image"
                            />
                        </div>
                    </div>
                </div>
            </section>
            < Footer />
        </>
    )
}

export default Login;