import { useState,useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function PaymentsReceived(){
    const [payments,setPayments] = useState([])
    let {landlordID} = useParams()

    useEffect(() => {
        const fetchPaymentsMade = async () => {
            try{
            let response = await fetch(`http://localhost:8000/rent/landlord/${landlordID}`)
            let data = await response.json()
            console.log(data.payments_received)
            setPayments(data.payments_received)
            console.log(payments)
        }catch(error) {
            console.log(error)
        }
    }

        fetchPaymentsMade()
    }, [])
    
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
          pdf.save('Payments received.pdf');
        });
    };

    return(
        <> 
        <Link to={`/${landlordID}/tenants`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 m-4" >Back</Link>       
        <h2 className='m-4'>Payments Recieved</h2>
        <div className='relative overflow-x-auto'>
    <table border="1" className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-black'>
      <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
        <tr>
          <th scope="col" className="px-6 py-3">Tenant</th>
          <th scope="col" className="px-6 py-3">Amount Paid</th>
          <th scope="col" className="px-6 py-3">Balance</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, index) => (
          <tr key={index}>
            <td className='px-6 py-4'>{payment.tenant_name}</td>
            <td className='px-6 py-4'>{payment.total_amount_paid}</td>
            <td className='px-6 py-4'>{payment.balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <button onClick={generatePDF} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ml-4 mt-4'>Download as pdf</button>
    </div>
        </>
    )
}

export default PaymentsReceived