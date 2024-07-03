import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/header';
import Footer from './Components/footer';

const Property = () => {
  const [number_of_houses, setNumberOfHouses] = useState(0);
  const [number_of_1_bedroom_houses, setNumberOf1BedroomHouses] = useState(0);
  const [number_of_2_bedroom_houses, setNumberOf2BedroomHouses] = useState(0);
  const [number_of_3_bedroom_houses, setNumberOf3BedroomHouses] = useState(0);
  const [number_of_4_bedroom_houses, setNumberOf4BedroomHouses] = useState(0);
  const [base_rent_1_bedroom, setBaseRent1Bedroom] = useState(0);
  const [base_rent_2_bedroom, setBaseRent2Bedroom] = useState(0);
  const [base_rent_3_bedroom, setBaseRent3Bedroom] = useState(0);
  const [base_rent_4_bedroom, setBaseRent4Bedroom] = useState(0);

  const{ landlordID,propertyID } = useParams()
  const navigate = useNavigate()

  const handleYes = () => {
    navigate(`/${landlordID}/property`);
  };
  const handleNo = () => {
    navigate(`/${landlordID}/tenants`)
    toast.dismiss()
  }

  const toasty = () => {
    toast.info(
      <div className="p-4">
        <p className="text-lg mb-2">Do you want to add another property?</p>
        <button className='bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600' onClick={handleYes}>Yes</button>
        <button className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600' onClick={handleNo}>No</button>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        draggable: true,
      }
    );
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      number_of_houses,
      number_of_1_bedroom_houses,
      number_of_2_bedroom_houses,
      number_of_3_bedroom_houses,
      number_of_4_bedroom_houses,
      base_rent_1_bedroom,
      base_rent_2_bedroom,
      base_rent_3_bedroom,
      base_rent_4_bedroom,
    };
    console.log(formData);
    fetch(`http://localhost:8000/rent/${landlordID}/${propertyID}/property_details`,{
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
    })
    .then((res) => res.json())
    .then((data) =>{
        console.log(data)
        resetForm()
    })
    .catch ((error) =>{
        console.log(error)
    })

    const resetForm = () =>{
        setBaseRent1Bedroom('');
        setBaseRent2Bedroom('');
        setBaseRent3Bedroom('');
        setBaseRent4Bedroom('');
        setNumberOfHouses('');
        setNumberOf1BedroomHouses('');
        setNumberOf2BedroomHouses('');
        setNumberOf3BedroomHouses('');
        setNumberOf4BedroomHouses('');
        
    }
  };

  return (
    <>
    <Header />
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">Property details</h1>
        <form onSubmit={handleSubmit} className="bg-white  px-8 pt-6 pb-8 m-0">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_houses">
              Number of Houses
            </label>
            <input
              type="number"
              id="number_of_houses"
              name="number_of_houses"
              value={number_of_houses}
              onChange={(e) => setNumberOfHouses(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_1_bedroom_houses">
                Number of 1 Bedroom Houses
              </label>
              <input
                type="number"
                id="number_of_1_bedroom_houses"
                name="number_of_1_bedroom_houses"
                value={number_of_1_bedroom_houses}
                onChange={(e) => setNumberOf1BedroomHouses(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_rent_1_bedroom">
                Base Rent for 1 Bedroom Houses
              </label>
              <input
                type="number"
                id="base_rent_1_bedroom"
                name="base_rent_1_bedroom"
                value={base_rent_1_bedroom}
                onChange={(e) => setBaseRent1Bedroom(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_2_bedroom_houses">
                Number of 2 Bedroom Houses
              </label>
              <input
                type="number"
                id="number_of_2_bedroom_houses"
                name="number_of_2_bedroom_houses"
                value={number_of_2_bedroom_houses}
                onChange={(e) => setNumberOf2BedroomHouses(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_rent_2_bedroom">
                Base Rent for 2 Bedroom Houses
              </label>
              <input
                type="number"
                id="base_rent_2_bedroom"
                name="base_rent_2_bedroom"
                value={base_rent_2_bedroom}
                onChange={(e) => setBaseRent2Bedroom(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_3_bedroom_houses">
                Number of 3 Bedroom Houses
              </label>
              <input
                type="number"
                id="number_of_3_bedroom_houses"
                name="number_of_3_bedroom_houses"
                value={number_of_3_bedroom_houses}
                onChange={(e) => setNumberOf3BedroomHouses(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_rent_3_bedroom">
                Base Rent for 3 Bedroom Houses
              </label>
              <input
                type="number"
                id="base_rent_3_bedroom"
                name="base_rent_3_bedroom"
                value={base_rent_3_bedroom}
                onChange={(e) => setBaseRent3Bedroom(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_4_bedroom_houses">
                Number of 4 Bedroom Houses
              </label>
              <input
                type="number"
                id="number_of_4_bedroom_houses"
                name="number_of_4_bedroom_houses"
                value={number_of_4_bedroom_houses}
                onChange={(e) => setNumberOf4BedroomHouses(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_rent_4_bedroom">
                Base Rent for 4 Bedroom Houses
              </label>
              <input
                type="number"
                id="base_rent_4_bedroom"
                name="base_rent_4_bedroom"
                value={base_rent_4_bedroom}
                onChange={(e) => setBaseRent4Bedroom(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toasty}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      < ToastContainer/>
    </div>
    < Footer />
    </>
  );
};

export default Property;
