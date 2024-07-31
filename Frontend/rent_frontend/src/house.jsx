import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TenantHeader from "./Components/tenantHeader";
import Footer from "./Components/footer";

function House() {
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [bedroomCount, setBedroomCount] = useState("");
    const [numberOfHouses, setNumber] = useState(0)
    const [numberSingleRoom, setSingleRoom] = useState(0)
    const [numberBedSitter, setBedSitter] = useState(0)
    const [numberOne, setOne] = useState(0)
    const [numberTwo, setTwo] = useState(0)
    const [numberThree, setThree] = useState(0)
    const [numberFour, setFour] = useState(0)
    const { landlordID, propertyID, tenantID } = useParams();
    const navigate = useNavigate();

    const getProperty = async () => {
        try {
            const response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/${landlordID}/${propertyID}/property_details`);
            const data = await response.json();
            console.log(data.property_details);
            setNumber(data.property_details.number_of_houses)
            console.log(numberOfHouses)
            setSingleRoom(data.property_details.number_of_single_rooms)
            console.log(numberSingleRoom)
            setBedSitter(data.property_details.number_of_bedsitters)
            console.log(numberBedSitter)
            setOne(data.property_details.number_of_1_bedroom_houses)
            setTwo(data.property_details.number_of_2_bedroom_houses)
            setThree(data.property_details.number_of_3_bedroom_houses)
            setFour(data.property_details.number_of_4_bedroom_houses)
            setPropertyDetails(data.property_details);

        } catch (error) {
            console.error("Error fetching property details:", error);
        }
    };

    useEffect(() => {
        getProperty();
    }, [landlordID, propertyID]);

    const submit = async (e) => {
        e.preventDefault();
    
        let dataToBeUpdated = {
            number_of_houses : numberOfHouses,
            number_of_single_rooms : numberSingleRoom,
            number_of_bedsitters : numberBedSitter,
            number_of_1_bedroom_houses : numberOne,
            number_of_2_bedroom_houses : numberTwo,
            number_of_3_bedroom_houses : numberThree,
            number_of_4_bedroom_houses : numberFour,
            base_rent_single_room : propertyDetails.base_rent_single_room,
            base_rent_bedsitter : propertyDetails.base_rent_bedsitter,
            base_rent_1_bedroom : propertyDetails.base_rent_1_bedroom,
            base_rent_2_bedroom : propertyDetails.base_rent_2_bedroom,
            base_rent_3_bedroom : propertyDetails.base_rent_3_bedroom,
            base_rent_4_bedroom : propertyDetails.base_rent_4_bedroom
        }
    
        console.log(dataToBeUpdated)
        const response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/${landlordID}/${propertyID}/property_details`, {
            method: 'PUT',
            body: JSON.stringify(dataToBeUpdated),
            headers: { 'Content-Type': 'application/json' },
          });
    
          let data = await response.json()
    
          console.log({"Update successfull":data})
    
        if (!bedroomCount) {
            console.log("No bedroom type selected");
            return;
        }

        const dataToBePosted = {
            bedroomCount
        };

        try {
            const response = await fetch(`https://rent-ease-jxhm.onrender.com/rent/${propertyID}/${tenantID}/house_details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToBePosted)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log(data);
            setNumber(numberOfHouses - 1);
            console.log(numberOfHouses)
            navigate(`/${tenantID}/${propertyID}`);
        } catch (error) {
            console.error("Error:", error);
        }
    };


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
                <form onSubmit={submit}>
                    <ul className="grid gap-6 md:grid-cols-3 m-4">
                        {propertyDetails.number_of_bedsitters > 0 && (
                            <li>
                                <input
                                    type="checkbox"
                                    id="bedsitter-option"
                                    value="bedsitter"
                                    checked={bedroomCount === "bedsitter"}
                                    onClick={() => {
                                        setBedSitter(numberBedSitter - 1)
                                        setNumber(numberOfHouses -1)
                                    }}
                                    onChange={() => handleCheckboxChange("bedsitter")}
                                    className="hidden peer"
                                />
                                <label
                                    htmlFor="bedsitter-option"
                                    className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                                >
                                    <div className="block">
                                        <div className="w-full text-lg font-semibold">Bedsitter</div>
                                        <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_bedsitters}</div>
                                        <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_bedsitter}</div>
                                    </div>
                                </label>
                            </li>
                        )}
                        {propertyDetails.number_of_single_rooms > 0 && (
                            <li>
                                <input
                                    type="checkbox"
                                    id="single-room-option"
                                    value="single_room"
                                    checked={bedroomCount === "single_room"}
                                    onChange={() => handleCheckboxChange("single_room")}
                                    onClick={() => {
                                        setSingleRoom(numberSingleRoom - 1)
                                        setNumber(numberOfHouses - 1)
                                    }}
                                    className="hidden peer"
                                />
                                <label
                                    htmlFor="single-room-option"
                                    className="inline-flex items-center justify-between w-full p-5 text-black bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:text-gray-600 peer-checked:border-blue-600"
                                >
                                    <div className="block">
                                        <div className="w-full text-lg font-semibold">Single room</div>
                                        <div className="w-full text-sm">Number of houses: {propertyDetails.number_of_single_rooms}</div>
                                        <div className="w-full text-sm">Base Rent: {propertyDetails.base_rent_single_room}</div>
                                    </div>
                                </label>
                            </li>
                        )}
                        {propertyDetails.number_of_1_bedroom_houses > 0 && (
                            <li>
                                <input
                                    type="checkbox"
                                    id="one-bedroom-option"
                                    value="1"
                                    checked={bedroomCount === "1"}
                                    onChange={() => handleCheckboxChange("1")}
                                    onClick={() => {
                                        setOne(numberOne - 1)
                                        setNumber(numberOfHouses - 1)
                                    }}
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
                                    onClick={() => {
                                        setTwo(numberTwo - 1)
                                        setNumber(numberOfHouses - 1)
                                    }}
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
                                    onClick={() => {
                                        setThree(numberThree - 1)
                                        setNumber(numberOfHouses - 1)
                                    }}
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
                                    onClick={() => {
                                        setFour(numberFour - 1)
                                        setNumber(numberOfHouses - 1)
                                    }}
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
                    <button
                        type="submit"
                        className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Done
                    </button>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default House;
