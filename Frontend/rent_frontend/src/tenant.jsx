import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logout from "./logout";
import Payments from "./payments";
import TenantHeader from "./Components/tenantHeader";
import Utilities from "./utilities";

function Tenant (){
    const [first_name, setFirst] = useState('')
    const [last_name, setLast] = useState('')
    const [email,setEmail] = useState('')

    const {tenantID} = useParams()

    const fetchTenant = async () =>{
        let response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/tenants/${tenantID}`)
        let data = await response.json()
        console.log(data)
        setFirst(data.first_name)
        setLast(data.last_name)
        setEmail(data.email)
    }

    useEffect(() =>{
        fetchTenant()
    },[])
    return(
        <>
            <TenantHeader/>
            <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">Welcome <span className="text-blue-600 dark:text-blue-500">{first_name} {last_name}</span></h1>
            <h2 className="m-4 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">{email}</h2>
            < Utilities />
            <Payments />
            {/* <Link to = {`/${tenantID}/payments`}>Make payments</Link> */}
            <Logout />
        </>
    )
}

export default Tenant;