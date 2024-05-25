import { useState, useEffect } from "react";
import Header from "./Components/header";

function Tenants() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/rent/tenants");
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
    <Header/>
    <div>
      <ul>
        {tenants.map((tenant, index) => (
          <li key={index}>{tenant.first_name} {tenant.last_name}</li>
        ))}
      </ul>
    </div>
    </>
  );
}

export default Tenants;
