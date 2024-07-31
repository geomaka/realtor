import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Logout (){
    const navigate = useNavigate()
    const [loggedOut,setLoggedOut] = useState(false)
    const [message, setMessage] = useState("");

    let logOut = async(e) =>{
        e.preventDefault()
        let response = await fetch("https://rent-ease-jxhm.onrender.com/rent/logout")
        let data = await response.json()
        if(data.message){
            setMessage(data.message)
            navigate('/login',{ state: { message: data.message, loggedOut : true } })
            setLoggedOut(true)
        }
        console.log(data)
    }

    return (
        <>
        <div>
            <form onSubmit={logOut}>
                <input type="submit" value= "Log out" 
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 mt-4 ml-4"/>
            </form>
        </div>
        </>
    )
}

export default Logout;