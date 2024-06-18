import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Link } from 'react-router-dom';

function Utilities() {
  const [rent, setRent] = useState(0);
  const [inputFields, setInputFields] = useState([{ utility_name: '', utility_cost: '' }]);
  const [utilities, setUtilities] = useState([])
  const { landlordID } = useParams();
  const [total,setTotal] = useState(0)

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
    const dataToBePosted = { rent, inputFields };
    let jsonData = JSON.stringify(dataToBePosted)
    console.log(jsonData);
    axios.post(`http://localhost:8000/rent/adminsignup/${landlordID}/add-utilities`, dataToBePosted)
      .then(response => {
        setUtilities(response.data.utilities)
        setTotal(response.data.total)
        console.log(utilities)
        console.log(response.data)
      })
      .catch(error => console.error(error));
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-xs">
          <form onSubmit={submit}>
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
            <span className="block mt-1 text-gray-500 mb-4">Total :{total}</span>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Rent :
              </label>
              <input
                type="text"
                name="rent"
                placeholder="Enter the rent"
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
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
            { total === 0 ? (<Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-not-allowed opacity-50">Done</Link>): (<Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Done</Link>)}
          </div>
        </div>
      </div>
    </>
  );
}

export default Utilities;
