import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logout from "./logout";
import Payments from "./payments";
import TenantHeader from "./Components/tenantHeader";
import Utilities from "./utilities";

function Tenant() {
    const [first_name, setFirst] = useState('');
    const [last_name, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [utilities, setUtilities] = useState([]);
    const [total, setTotal] = useState(0);


    const { tenantID } = useParams();

    const fetchTenant = async () => {
        try {
            let response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/tenants/${tenantID}`);
            let data = await response.json();
            console.log(data);
            setFirst(data.first_name);
            setLast(data.last_name);
            setEmail(data.email);
            setUtilities(data.utilities || []);
        } catch (error) {
            console.error("Error fetching tenant data:", error);
        }
    };

    useEffect(() => {
        fetchTenant();
    }, [tenantID]);

    return (
        <>
            <TenantHeader />
            <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">
                Welcome <span className="text-blue-600 dark:text-blue-500">{first_name} {last_name}</span>
            </h1>
            <h2 className="m-4 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">{email}</h2>
            <div className="m-4">
                {utilities.length === 0 ? (
                    <p>No utilities available.</p>
                ) : (
                    <ul>
                        {utilities.map((utility, index) => (
                            <li key={index} className="mb-2">
                                <div>{utility.utility_name}: Ksh {utility.utility_cost.toFixed(2)}</div>
                                <span className="block mt-1 text-gray-500 mb-4">Total: {utility.total}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Payments />
            <Logout />
        </>
    );
}

export default Tenant;
