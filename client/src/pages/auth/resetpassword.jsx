import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Retrieve token from URL params
  const navigate = useNavigate();

  
   
    const location = useLocation();
  
    const urlParams = new URLSearchParams(location.search);
    const queryToken = urlParams.get('token');

  useEffect(() => {
    
    
    // You can add validation for the token here if required
  }, [token,queryToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    console.log(queryToken);
    console.log(password);
    
    

    try {
      setLoading(true);
      const response = await fetch("/api/auth/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, token:queryToken }),  // Send password and token to backend
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful!");
        setTimeout(() => navigate("/auth/login"), 2000); // Redirect to login after success
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {message && <p className="text-red-500 text-sm text-center">{message}</p>}

          <div>
            <button
              type="submit"
              className={`w-full py-3 px-4 bg-black text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
