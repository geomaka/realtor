import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TenantHeader from "./Components/tenantHeader";
import Footer from "./Components/footer";

function House() {
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [bedroomCount, setBedroomCount] = useState("");
    const { landlordID, propertyID,tenantID } = useParams();
    const navigate = useNavigate()

    const submit = async (e) =>{
        e.preventDefault()
        let dataToBePosted = {
            bedroomCount
        }
        console.log(bedroomCount)
        fetch(`http://localhost:8000/rent/${propertyID}/${tenantID}/house_details`,{
            method : "POST",
            headers : { "Content-Type": "application/json" },
            body : JSON.stringify(dataToBePosted)
        })
        .then((res) => res.json())
        .then((data) =>{
            console.log(data)
            navigate(`/${tenantID}`)
        })
        .catch((error) =>{
            console.log(error)
        })

    }

    const getProperty = async () => {
        try {
            const response = await fetch(`http://localhost:8000/rent/${landlordID}/${propertyID}/property_details`);
            const data = await response.json();
            console.log(data.property_details);
            setPropertyDetails(data.property_details);
        } catch (error) {
            console.error("Error fetching property details:", error);
        }
    };

    useEffect(() => {
        getProperty();
    }, [landlordID, propertyID]);

    const handleCheckboxChange = (bedroom) => {
        setBedroomCount(bedroom);
    };

    if (!propertyDetails) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <TenantHeader />
            <div className="h-screen">
                <h3 className="m-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">House Details:</h3>
                <h2 className="m-4 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Choose according to your house</h2>
                <ul className="grid gap-6 md:grid-cols-3 m-4">
                    {propertyDetails.number_of_1_bedroom_houses > 0 && (
                        <li>
                            <input
                                type="checkbox"
                                id="one-bedroom-option"
                                value="1"
                                checked={bedroomCount === "1"}
                                onChange={() => handleCheckboxChange("1")}
                                className="hidden peer"
                            />
                            <label
                                htmlFor="one-bedroom-option"
                                className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                            >
                                <div className="block">
                                    <div className="w-full text-lg font-semibold">1 Bedroom</div>
                                    <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_1_bedroom_houses}</div>
                                    <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_1_bedroom}</div>
                                </div>
                            </label>
                        </li>
                    )}
                    {propertyDetails.number_of_2_bedroom_houses > 0 && (
                        <li>
                            <input
                                type="checkbox"
                                id="two-bedroom-option"
                                value="2"
                                checked={bedroomCount === "2"}
                                onChange={() => handleCheckboxChange("2")}
                                className="hidden peer"
                            />
                            <label
                                htmlFor="two-bedroom-option"
                                className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                            >
                                <div className="block">
                                    <div className="w-full text-lg font-semibold">2 Bedrooms</div>
                                    <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_2_bedroom_houses}</div>
                                    <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_2_bedroom}</div>
                                </div>
                            </label>
                        </li>
                    )}
                    {propertyDetails.number_of_3_bedroom_houses > 0 && (
                        <li>
                            <input
                                type="checkbox"
                                id="three-bedroom-option"
                                value="3"
                                checked={bedroomCount === "3"}
                                onChange={() => handleCheckboxChange("3")}
                                className="hidden peer"
                            />
                            <label
                                htmlFor="three-bedroom-option"
                                className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                            >
                                <div className="block">
                                    <div className="w-full text-lg font-semibold">3 Bedrooms</div>
                                    <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_3_bedroom_houses}</div>
                                    <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_3_bedroom}</div>
                                </div>
                            </label>
                        </li>
                    )}
                    {propertyDetails.number_of_4_bedroom_houses > 0 && (
                        <li>
                            <input
                                type="checkbox"
                                id="four-bedroom-option"
                                value="4"
                                checked={bedroomCount === "4"}
                                onChange={() => handleCheckboxChange("4")}
                                className="hidden peer"
                            />
                            <label
                                htmlFor="four-bedroom-option"
                                className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                            >
                                <div className="block">
                                    <div className="w-full text-lg font-semibold">4 Bedrooms</div>
                                    <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_4_bedroom_houses}</div>
                                    <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_4_bedroom}</div>
                                </div>
                            </label>
                        </li>
                    )}
                </ul>
                <input type="submit" className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" value="Done" onClick={submit} />
            </div>
            <Footer />
        </>
    );
}

export default House;
