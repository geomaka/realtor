import { useState, useEffect } from "react";
import Header from "./Components/header";
import { Link, useParams } from "react-router-dom";
import user from "../public/user.svg";
import DeleteTenant from "./delete";
import Footer from "./Components/footer";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const { landlordID } = useParams();
  const [properties, setProperties] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleFilterClick = (propertyName) => {
    setSelectedFilters((prev) =>
      prev.includes(propertyName)
        ? prev.filter(name => name !== propertyName)
        : [...prev, propertyName]
    );
  };

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/rent/${landlordID}/tenants`);
        const data = await response.json();
        setTenants(data.tenants);
        const uniqueProperties = [...new Set(data.tenants.map(tenant => tenant.property_details.property_name))];
        setProperties(uniqueProperties);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTenants();
  }, [landlordID]);

  const filteredTenants = tenants.filter(tenant =>
    selectedFilters.length === 0 || selectedFilters.includes(tenant.property_details.property_name)
  );

  return (
    <>
      <Header />
      <div className="flex flex-wrap gap-2 p-4 justify-center">
        {properties.map((property, index) => {
          const isSelected = selectedFilters.includes(property);
          return (
            <button
              key={index}
              onClick={() => handleFilterClick(property)}
              className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium ${isSelected ? 'text-blue-700 bg-gray-100' : 'text-gray-900 bg-white'} border border-gray-200 rounded-full focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-blue-500 dark:bg-blue-500 dark:text-black dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700`}
            >
              {property}
              {isSelected && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterClick(property);
                  }}
                  className="ml-2 text-xl font-bold"
                >
                  &times;
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center pt-4 px-4">
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-white-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-black">Tenants</h5>
          </div>
          <div className="flow-root">
            {tenants.length === 0 ? (
              <h6>No tenants</h6>
            ) : (
              <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTenants.length === 0 ? (
                  <h6>No tenants match the selected filters.</h6>
                ) : (
                  filteredTenants.map((tenant, index) => (
                    <li key={index} className="py-3 sm:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img className="w-8 h-8 rounded-full" src={user} alt={tenant.name} />
                        </div>
                        <div className="flex-1 min-w-0 ms-4">
                          <Link to={`/${landlordID}/tenant-info/${tenant.house_number}`} className="text-sm font-medium text-gray-900 truncate dark:text-black">
                            {tenant.first_name} {tenant.last_name} - {tenant.property_details.property_name}
                          </Link>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {tenant.email}
                          </p>
                          <DeleteTenant tenant={tenant} />
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
      < Footer />
    </>
  );
}

export default Tenants;
