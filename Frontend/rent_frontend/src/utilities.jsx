import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Link } from 'react-router-dom';
import Property from "./property";

function Utilities() {
  const [bedroomCount, setBedroomCount] = useState(0);
  const [inputFields, setInputFields] = useState([{ utility_name: '', utility_cost: '' }]);
  const [utilities, setUtilities] = useState([])
  const { landlordID, propertyID } = useParams();
  const [total, setTotal] = useState(0)

  const removeUtility = (index) => {
    const utilityID = utilities[index].id;
    deleteUtility(utilityID, landlordID)
    setUtilities(utilities.filter((_, i) => i !== index));
  };

  const deleteUtility = async (utilityID, landlordID) => {
    try {
      let response = await fetch(`http://localhost:8000/rent/adminsignup/${landlordID}/delete-utilities/${utilityID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log(data);
        setTotal(data.total)
      } else {
        console.log("Failed");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleFormChange = (index, event) => {
    let newData = [...inputFields];
    newData[index][event.target.name] = event.target.value;
    setInputFields(newData);
  };

  const addFields = () => {
    setInputFields([...inputFields, { utility_name: '', utility_cost: '' }]);
  };

  const submit = (e) => {
    e.preventDefault();
    const dataToBePosted = { bedroomCount, inputFields };
    let jsonData = JSON.stringify(dataToBePosted)
    console.log(jsonData);
    axios.post(`http://localhost:8000/rent/adminsignup/${landlordID}/${propertyID}/add-utilities`, dataToBePosted)
      .then(response => {
        setUtilities(response.data.utilities)
        setTotal(response.data.total)
        console.log(utilities)
        console.log(response.data)
      })
      .catch(error => console.error(error));

    const handleYes = () => {
      navigate(`/${landlordID}/property`);
    };
    const handleNo = () => {
      toast.dismiss()
    }

    const toast = () => {
      toast.info(
        <div className="p-4">
          <p className="text-lg mb-2">Do you want to add another property?</p>
          <button className='bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600' onClick={handleYes}>Yes</button>
          <button className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600' onClick={handleNo}>No</button>
        </div>,
        {
          // position: toast.POSITION.TOP_CENTER,
          autoClose: false,
          closeButton: false,
          draggable: true,
        }
      );
    }
  };

  return (
    <>
      < Property />
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">Add utilities</h1>
          <h2 className="m-4 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Use the add more to add more utilities according to type of house e.g "1 Bedroom house" and the bedroom count will be "1".</h2>
          <form onSubmit={submit} className="bg-white  px-8 pt-6 pb-8 m-0">
            <ul>
              {utilities.length === 0 ? (
                <h1 className="mb-4">No utilities</h1>
              ) : (
                utilities.map((utility, index) => (
                  <li key={index} className="mb-4">
                    <div>
                      {utility.utility_name} : {utility.utility_cost}
                      <span>
                        <button
                          onClick={() => removeUtility(index)}
                          className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <span className="block mt-1 text-gray-500 mb-4">{bedroomCount} Bedroom Total : {total}</span>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Bedroom Count :
              </label>
              <input
                type="text"
                name="bedroom_count"
                placeholder="Enter the number of bedroom"
                value={bedroomCount}
                onChange={(e) => setBedroomCount(Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {inputFields.map((input, index) => (
              <div key={index}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Utility name :
                  </label>
                  <input
                    name="utility_name"
                    placeholder="Utility name"
                    value={input.utility_name}
                    onChange={(e) => handleFormChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Utility cost :
                  </label>
                  <input
                    name="utility_cost"
                    placeholder="Utility cost"
                    value={input.utility_cost}
                    onChange={(e) => handleFormChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={addFields} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add More..</button>
              <input type="submit" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" />
            </div>
          </form>
          <div className="mb-4">
            {total === 0 ? (<Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-not-allowed opacity-50">Done</Link>) : (<Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" onClick={toast} >Done</Link>)}
          </div>
        </div>
      </div>
    </>
  );
}

export default Utilities;
