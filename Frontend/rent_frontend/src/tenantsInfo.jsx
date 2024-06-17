import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import user from "../public/user.svg"
import DeleteTenant from "./delete";

function TenantInfo(){
    const [first_name, setFirst] = useState('')
    const [last_name, setLast] = useState('')
    const [email,setEmail] = useState('')
    const [phone,setPhone] = useState('')

    const {landlordID} = useParams()
    const{tenantID} = useParams()
    console.log(landlordID)

    const fetchTenantDetails = async () =>{
        let response = await fetch(`http://localhost:8000/rent/tenants/${tenantID}`)
        let data = await response.json()
        // console.log(data)
        setFirst(data.first_name)
        setLast(data.last_name)
        setEmail(data.email)
        setPhone(data.phone)
    }

    useEffect(() =>{
        fetchTenantDetails()
    },[])

    return(
        <>
            <div className="bg-white overflow-hidden shadow rounded-lg border">
                <div className="px-4 py-5 sm:px-6">
                    <Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 mb-4" >Back</Link>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Tenant's info:
                    </h3>
                    <img className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto my-4"
                        src={user} alt={first_name} />
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Full name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {first_name} {last_name}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Email address
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {email}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Phone number
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {phone}
                            </dd>
                        </div>
                    </dl>
                </div>
                < DeleteTenant />
            </div>
        </>
    )
}

export default TenantInfo