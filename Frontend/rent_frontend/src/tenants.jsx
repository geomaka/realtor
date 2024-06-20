import { useState, useEffect } from "react";
import Header from "./Components/header";
import { Link, useParams } from "react-router-dom";
import user from "../public/user.svg"
import DeleteTenant from "./delete";


function Tenants() {
  const [tenants, setTenants] = useState([]);
  const {landlordID} = useParams()

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/rent/${landlordID}/tenants`);
        const tenants = await response.json();
        setTenants(tenants.tenants);
        console.log(tenants);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTenants();
  }, []);

  return (
    <>
      <Header />
      <div className="flex justify-center pt-4 px-4">
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-white-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-black">Tenants</h5>
          </div>
          <div className="flow-root">
            {tenants.length == 0 ? (<h6>No tenants</h6>):(
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {tenants.map((tenant, index) => (
                <li key={index} className="py-3 sm:py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img className="w-8 h-8 rounded-full" src={user} alt={tenant.name} />
                    </div>
                    <div className="flex-1 min-w-0 ms-4">
                      <Link to={`/${landlordID}/tenant-info/${tenant.house_number}`} className="text-sm font-medium text-gray-900 truncate dark:text-black">
                        {tenant.first_name} {tenant.last_name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        {tenant.email}
                      </p>
                      < DeleteTenant tenant={tenant} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Tenants;
