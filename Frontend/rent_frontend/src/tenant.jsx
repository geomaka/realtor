import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logout from "./logout";

function Tenant (){
    const [first_name, setFirst] = useState('')
    const [last_name, setLast] = useState('')
    const [email,setEmail] = useState('')

    const {tenantID} = useParams()

    const fetchTenant = async () =>{
        let response = await fetch(`http://localhost:8000/rent/tenants/${tenantID}`)
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
            
            <h1>Welcome {first_name} {last_name}</h1>
            <h2>{email}</h2>
            <Link to = {`/${tenantID}/payments`}>Make payments</Link>
            <Logout />
        </>
    )
}

export default Tenant;