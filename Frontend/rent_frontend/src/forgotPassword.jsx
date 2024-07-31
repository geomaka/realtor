import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://rent-ease-jxhm.onrender.com/rent/api/forgot-password/', { email });
      setMessage('Password reset link has been sent to your email.');
      setError('');
    } catch (error) {
      setError('An error occurred while trying to reset your password.');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
        {message && <div className="mb-4 text-green-500">{message}</div>}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-3 py-2 mb-4 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* <Link to={'/login/reset-password'}> */}
          <button
            className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Send Reset Link
          </button>
          {/* </Link> */}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
