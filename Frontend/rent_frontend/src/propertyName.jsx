import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function PropertyName (){
const [property,setPropertyName] = useState('')
const { landlordID } = useParams()

const navigate = useNavigate()

const handleSubmit = async (e) =>{
    e.preventDefault()
    let propertyData = {
        property_name: property,
    }

    fetch(`http://localhost:8000/rent/${landlordID}/property`,{
        method : 'POST',
        headers: { "Content-Type": "application/json" },
        body : JSON.stringify(propertyData)
    })
    .then((res) => res.json())
    .then((data) =>{
        console.log(data)
        let propertyID = data.property.property_id
        console.log(propertyID)
        // resetForm()
        navigate(`/${landlordID}/${propertyID}/utilities`)
    })

    const resetForm = () =>{
        setPropertyName('')
    }
}

    return(
        <>
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="property">
              Property Name
            </label>
            <input
              type="text"
              id="property"
              name="property"
              value={property}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Enter property name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
        </form>
        </>
    )
}

export default PropertyName;