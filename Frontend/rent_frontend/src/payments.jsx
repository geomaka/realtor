import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';

function Payments (){
    const [payments,setPayments] = useState([])
    const [amount,setAmount] = useState('')
    const { tenantID }= useParams()
    
    console.log(tenantID)

    const fetchPayments = async () =>{
      let response = await fetch(`http://localhost:8000/rent/tenants/${tenantID}/payments`)
      let data = await response.json()
      setPayments(data.payments)
      console.log(payments)
    }

    useEffect(() =>{
      fetchPayments()
    },[])
 
    const handleSubmit = (e) =>{
        e.preventDefault()
        let data_to_be_posted = {
            amount
        }
        fetch(`http://localhost:8000/rent/tenants/${tenantID}/payments`,{
            method : "POST",
            body : JSON.stringify(data_to_be_posted),
            headers : {'Content-Type' : 'application/json'}
        })
        .then((res) => res.json())
        .then((data) => {
          setPayments([data.data])
          fetchPayments()
          console.log(data.data)})
        .catch((error) =>{
            console.log(error)
        })
    }

    return (
        <>
        <h1>Pay:</h1>
        <form onSubmit={handleSubmit}>
        <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            name="amount" 
            placeholder="Enter the amount to pay"/>
        <button type="submit">Pay</button>
        </form>
        <h2>Payments made</h2>
    <table border="1">
      <thead>
        <tr>
          <th>Tenant</th>
          <th>Landlord</th>
          <th>Amount Paid</th>
          <th>Balance</th>
          <th>Date Paid</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, index) => (
          <tr key={index}>
            <td>{payment.name}</td>
            <td>{payment.landlord}</td>
            <td>{payment.Paid}</td>
            <td>{payment.balance}</td>
            <td>{payment.date_Paid}</td>
          </tr>
        ))}
      </tbody>
    </table>

        </>
    )
}

export default Payments;