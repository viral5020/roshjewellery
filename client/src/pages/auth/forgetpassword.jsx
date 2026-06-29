import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success | error
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email.');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Failed to send reset instructions.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Title */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-serif italic text-rosh-primary mb-2">
          Forgot Password
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">
          Request a password reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none placeholder:text-rosh-primary/30 transition-colors focus:border-rosh-primary"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent hover:text-white transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>

      {/* Messages */}
      {message && (
        <p className={`mt-4 text-center text-xs tracking-wide ${
          messageType === 'error' ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </p>
      )}

      {/* Return to Login */}
      <div className="text-center text-xs tracking-wide text-rosh-primary/60">
        Remembered your password?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-rosh-accent hover:text-rosh-primary transition-colors uppercase tracking-[0.1em] text-[10px] ml-1 border-b border-rosh-accent/40 pb-0.5"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
