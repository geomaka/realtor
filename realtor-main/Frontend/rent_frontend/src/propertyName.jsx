import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Image from '../public/icons8-home.svg';

function PropertyName() {
    const [property, setPropertyName] = useState('');
    const [property_location, setLocation] = useState('');
    const { landlordID } = useParams();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let propertyData = {
            property_name: property,
            property_location
        };

        fetch(`https://rent-ease-jxhm.onrender.com/rent/${landlordID}/property`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(propertyData)
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            let propertyID = data.property.property_id;
            console.log(propertyID);
            navigate(`/${landlordID}/${propertyID}/property-detail`);
        });

        const resetForm = () => {
            setPropertyName('');
            setLocation('');
        };
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form 
                className="max-w-sm w-full bg-white p-8 rounded-lg shadow-md border border-gray-300"
                onSubmit={handleSubmit}
            >
                <div className="flex justify-center mb-4">
                    <img src={Image} alt="Property" className="w-16 h-16" />
                </div>
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
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                        Property Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="property_location"
                        value={property_location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder='Enter the location of the property e.g. "Tawa houses, Nairobi"'
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
        </div>
    );
}

export default PropertyName;
