import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const { tenantID } = useParams();

  const fetchPayments = async () => {
    try {
      let response = await fetch(`https://realtor-1-kllo.onrender.com/rent/tenants/${tenantID}/payments`);
      let data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [tenantID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data_to_be_posted = {
      amount
    };
    try {
      let response = await fetch(`https://realtor-1-kllo.onrender.com/rent/tenants/${tenantID}/payments`, {
        method: "POST",
        body: JSON.stringify(data_to_be_posted),
        headers: { 'Content-Type': 'application/json' }
      });
      let data = await response.json();
      setPayments(prevPayments => [data.data, ...prevPayments]);
      setAmount(''); // Clear the input field after successful payment
    } catch (error) {
      console.error("Error making payment:", error);
    }
  };

  const generatePDF = () => {
    const input = document.getElementById('table-to-pdf');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Payments made.pdf');
      });
  };

  return (
    <>
      <h1 className='m-8 text-lg font-extrabold text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-blue-500'>Make payments</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <label htmlFor="small-input" className="block m-4 text-sm font-medium text-gray-900 dark:text-black">Enter the amount to pay</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            name="amount"
            placeholder="Enter the amount to pay"
            className='m-4 w-1/2 block p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500'
          />
        </div>
        <button type="submit" className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 m-4 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay</button>
      </form>
      <h2 className='m-4'>Payments made</h2>
      <div className='relative overflow-x-auto'>
        <table id='table-to-pdf' border="1" className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-black'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope="col" className="px-6 py-3">Tenant</th>
              <th scope="col" className="px-6 py-3">Landlord</th>
              <th scope="col" className="px-6 py-3">Amount Paid</th>
              <th scope="col" className="px-6 py-3">Balance</th>
              <th scope="col" className="px-6 py-3">Date Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={index}>
                <td className='px-6 py-4'>{payment.name}</td>
                <td className='px-6 py-4'>{payment.landlord}</td>
                <td className='px-6 py-4'>{payment.paid}</td>
                <td className='px-6 py-4'>{payment.balance}</td>
                <td className='px-6 py-4'>{format(new Date(payment.date_paid), "MMMM dd, yyyy HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={generatePDF} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ml-4 mt-4'>Download as pdf</button>
      </div>
    </>
  );
}

export default Payments;
