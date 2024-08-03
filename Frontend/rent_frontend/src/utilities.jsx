import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

function Utilities({ propertyID }) {
  const [bedroomCount, setBedroomCount] = useState('');
  const [inputFields, setInputFields] = useState([{ utility_name: '', utility_cost: '' }]);
  const [utilities, setUtilities] = useState([]);
  const [total, setTotal] = useState(0);

  const { tenantID } = useParams();

  useEffect(() => {
    if (propertyID && tenantID) {
      const fetchBedroomCount = async () => {
        try {
          const response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/${propertyID}/${tenantID}/house_details`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setBedroomCount(data.bedroom_count);
        } catch (error) {
          console.error('Error fetching bedroom count:', error);
        }
      };

      const timer = setTimeout(() => {
        fetchBedroomCount();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [propertyID, tenantID]); 

  const removeUtility = async (index) => {
    const utilityID = utilities[index].id;
    await deleteUtility(utilityID);
    setUtilities(utilities.filter((_, i) => i !== index));
  };

  const deleteUtility = async (utilityID) => {
    try {
      let response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/${tenantID}/delete-utilities/${utilityID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTotal(data.total);
      } else {
        console.log("Failed to delete utility");
      }
    } catch (error) {
      console.error('Error deleting utility:', error);
    }
  };

  const handleFormChange = (index, event) => {
    const newData = [...inputFields];
    newData[index][event.target.name] = event.target.value;
    setInputFields(newData);
  };

  const addFields = () => {
    setInputFields([...inputFields, { utility_name: '', utility_cost: '' }]);
  };

  const submit = async (e) => {
    e.preventDefault();
    const dataToBePosted = { bedroomCount, inputFields };
    try {
      const response = await axios.post(`https://rent-ease-jxhm.onrender.com/rent/${tenantID}/${propertyID}/add-utilities`, dataToBePosted);
      setUtilities(response.data.utilities);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error adding utilities:', error);
    }
  };

  return (
    <>
      <div className="flex">
        <div className="w-full max-w-md">
          <h1 className="m-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">Add utilities</h1>
          <h2 className="m-4 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Add utilities before proceeding to make any payments</h2>
          <form onSubmit={submit} className="bg-white px-8 pt-6 pb-8 m-0">
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
            <span className="block mt-1 text-gray-500 mb-4">Total: {total}</span>
            {inputFields.map((input, index) => (
              <div key={index}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`utility_name_${index}`}>
                    Utility name:
                  </label>
                  <input
                    id={`utility_name_${index}`}
                    name="utility_name"
                    placeholder="Utility name"
                    value={input.utility_name}
                    onChange={(e) => handleFormChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`utility_cost_${index}`}>
                    Utility cost:
                  </label>
                  <input
                    id={`utility_cost_${index}`}
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
              <input type="submit" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" value="Add" />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Utilities;
