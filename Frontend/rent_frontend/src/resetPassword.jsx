// src/components/ResetPassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      let dataToBePosted = {
        uid, token, password 
      }

      const response = await axios.post('http://localhost:8000/rent/api/reset-password', dataToBePosted);

      setMessage('Password has been reset successfully.');
      setError('');
      setTimeout(() => navigate('/login'));
    } catch (error) {
      setError('An error occurred while trying to reset your password.');
      setMessage('');
      console.log(error)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {message && <div className="mb-4 text-green-500">{message}</div>}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
            New Password
          </label>
          <input
            className="w-full px-3 py-2 mb-4 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            type="password"
            name="new_password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="w-full px-3 py-2 mb-4 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            type="password"
            name="confirm_Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
