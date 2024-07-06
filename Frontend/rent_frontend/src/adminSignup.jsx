import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminSignupForm() {
  const [first_name, setFirst] = useState('');
  const [last_name, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [payment_type, setPaymentType] = useState('till'); // Default to 'till'
  const [till_number, setTillNumber] = useState('');
  const [paybill_number, setPaybillNumber] = useState('');
  const [account_number, setAccountNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  const navigate = useNavigate();

  const createUser = (e) => {
    e.preventDefault();

    // Clear previous error message
    setErrorMessage('');

    // Client-side validation
    if (!first_name || !last_name || !phone || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (payment_type === 'till' && !till_number) {
      setErrorMessage('Till number is required for Till payment type.');
      return;
    }

    if (payment_type === 'paybill' && (!paybill_number || !account_number)) {
      setErrorMessage('Both Paybill number and Account number are required for Paybill payment type.');
      return;
    }

    const data = {
      first_name,
      last_name,
      phone,
      email,
      password,
      payment_type,
      till_number: payment_type === 'till' ? till_number : null,
      paybill_number: payment_type === 'paybill' ? paybill_number : null,
      account_number: payment_type === 'paybill' ? account_number : null,
    };

    fetch('http://localhost:8000/rent/adminsignup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    })
      .then((res) => {
        if (!res.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          // Handle API errors
          setErrorMessage(data.error);
        } else {
          let id = data.landlord_id;
          navigate(`/${id}/property`);
        }
      })
      .catch((error) => {
        // Handle fetch errors or any other errors
        setErrorMessage(error.message);
      });
  };

  return (
    <>
      <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
        <div className="md:w-1/3 max-w-sm">
          <img
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="admin-signup"
          />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="w-full max-w-xs">
            <h1 className="m-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-blue-500">
              Landlord Sign-up
            </h1>
            <form onSubmit={createUser}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                  First Name
                </label>
                <input
                  type="text"
                  value={first_name}
                  required
                  onChange={(e) => setFirst(e.target.value)}
                  name="first_name"
                  placeholder="Enter first name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  type="text"
                  value={last_name}
                  required
                  onChange={(e) => setLast(e.target.value)}
                  name="last_name"
                  placeholder="Enter last name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  required
                  onChange={(e) => setPhone(e.target.value)}
                  name="phone"
                  placeholder="Enter phone number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  placeholder="Enter email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  placeholder="Enter password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_type">
                  Payment Type
                </label>
                <select
                  value={payment_type}
                  onChange={(e) => setPaymentType(e.target.value)}
                  name="payment_type"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="till">Till Number</option>
                  <option value="paybill">Paybill Number</option>
                </select>
              </div>
              {payment_type === 'till' && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="till_number">
                    Till Number
                  </label>
                  <input
                    type="text"
                    value={till_number}
                    required
                    onChange={(e) => setTillNumber(e.target.value)}
                    name="till_number"
                    placeholder="Enter till number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              )}
              {payment_type === 'paybill' && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paybill_number">
                      Paybill Number
                    </label>
                    <input
                      type="text"
                      value={paybill_number}
                      required
                      onChange={(e) => setPaybillNumber(e.target.value)}
                      name="paybill_number"
                      placeholder="Enter paybill number"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account_number">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={account_number}
                      required
                      onChange={(e) => setAccountNumber(e.target.value)}
                      name="account_number"
                      placeholder="Enter account number"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </>
              )}
              {errorMessage && (
                <div className="mb-6 text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="flex items-center justify-between">
                <input
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  value="Sign up"
                />
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default AdminSignupForm;
