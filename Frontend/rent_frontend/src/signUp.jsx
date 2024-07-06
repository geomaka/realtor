import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Components/footer";

function SignUp() {
  const [landlords, setLandlords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [house_number, setHouse] = useState("");
  const [first_name, setFirst] = useState("");
  const [last_name, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [date_moved_in, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLandlordId, setSelectedLandlordId] = useState("");
  const [propertyID, setPropertyID] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      const response = await fetch("http://localhost:8000/rent/signup");
      if (!response.ok) {
        throw new Error("Failed to fetch landlords.");
      }
      const data = await response.json();
      setLandlords(data.landlords);
      if (data.landlords.length > 0) {
        setProperties(data.landlords[0].properties);
      }
    } catch (error) {
      console.error("Error fetching landlords:", error.message);
      setError("Failed to fetch landlords. Please try again later.");
    }
  };

  const handleSelection = (event) => {
    const selectedValue = event.target.value;
    const [landlordId, propertyId] = selectedValue.split("-");
    setSelectedLandlordId(landlordId);
    setPropertyID(propertyId);
    const selectedLandlord = landlords.find(
      (landlord) => landlord.id.toString() === landlordId
    );
    if (selectedLandlord) {
      setProperties(selectedLandlord.properties);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToBePosted = {
      property_id: propertyID,
      landlord_id: selectedLandlordId,
      first_name,
      last_name,
      phone,
      email,
      password,
      house_number,
      date_moved_in,
    };

    try {
      const response = await fetch("http://localhost:8000/rent/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToBePosted),
      });

      if (!response.ok) {
        throw new Error("Failed to sign up. Please try again later.");
      }

      const data = await response.json();
      let id = data.tenant.house_number;
      let landlordID = data.tenant.landlord_id;
      let propertyID = data.tenant.property_id;
      navigate(`/${id}/${landlordID}/${propertyID}/House-type`);
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError("Check details and try again.");
    }
  };

  return (
    <>
      <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
        <div className="md:w-1/3 max-w-sm">
          <img
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="Sample image"
          />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="w-full max-w-xs">
            <h1 className="m-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">
              Tenant sign-in
            </h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  House Number
                </label>
                <input
                  type="text"
                  value={house_number}
                  required
                  onChange={(e) => setHouse(e.target.value)}
                  name="house_number"
                  placeholder="Enter the house number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  First name
                </label>
                <input
                  type="text"
                  value={first_name}
                  required
                  onChange={(e) => setFirst(e.target.value)}
                  name="first_name"
                  placeholder="Enter first name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Last name
                </label>
                <input
                  type="text"
                  value={last_name}
                  required
                  onChange={(e) => setLast(e.target.value)}
                  name="last_name"
                  placeholder="Enter last name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Phone no.
                </label>
                <input
                  type="text"
                  value={phone}
                  required
                  onChange={(e) => setPhone(e.target.value)}
                  name="phone"
                  placeholder="Enter phone"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Date moved in
                </label>
                <input
                  type="date"
                  value={date_moved_in}
                  required
                  onChange={(e) => setDate(e.target.value)}
                  name="date_moved_in"
                  placeholder="Enter Date moved in"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  placeholder="Enter email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  placeholder="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="landlordSelect" className="sr-only">
                  Select a Landlord
                </label>
                <select
                  id="landlordSelect"
                  name="landlord_id"
                  className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-200 appearance dark:text-black dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  onChange={handleSelection}
                >
                  <option value="">Select a landlord</option>
                  {landlords.map((landlord) =>
                    landlord.properties.map((property) => (
                      <option
                        key={`${property.id}-${landlord.id}`}
                        value={`${landlord.id}-${property.id}`}
                      >
                        {`${landlord.first_name} ${landlord.last_name} - ${property.address}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  value="Sign in"
                />
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default SignUp;
