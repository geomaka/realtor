import React from "react";

function DeleteTenant({ tenant }) {
    const deleteTenant = (e) => {
        e.preventDefault()
        fetch(`https://realtor-1-kllo.onrender.com/rent/tenants/${tenant.house_number}/confirmdelete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if(data.status == "success"){
                    alert("Tenant deleted")
                    window.location.reload();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <>
            <button className="m-0 text-red-600 hover:text-red-800 text-sm" onClick={deleteTenant}>Remove</button>
        </>
    );
}

export default DeleteTenant;
