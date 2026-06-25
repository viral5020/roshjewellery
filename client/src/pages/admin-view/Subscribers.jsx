import React, { useEffect, useState } from 'react';

const SubscriberPage = () => {
  const [subscribers, setSubscribers] = useState([]); // State to store subscribers
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error message
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch('/api/newsletter/subscribers', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscribers');
        }

        const data = await response.json();

        // Check if the returned data is an array
        if (Array.isArray(data)) {
          setSubscribers(data); // Set the subscriber data to state
        } else {
          throw new Error('Invalid data format');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error during fetch:', error);
        setError(error.message); // Update error state
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term on input change
  };

  // Filter the subscribers based on the search term
  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div className="newsletter-page">
      <h1 className="page-heading">Newsletter Subscribers</h1>

      {error && <div className="error-message">{error}</div>} {/* Display error message */}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {!error && filteredSubscribers.length === 0 && (
        <div className="no-subscribers">No subscribers found.</div> // Show message if no subscribers
      )}

      {!error && filteredSubscribers.length > 0 && (
        <div className="subscriber-list">
          {filteredSubscribers.map((subscriber, index) => (
            <div className="subscriber-item" key={index}>
              <div className="subscriber-info">
                <h3>{subscriber.email}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .newsletter-page {
          padding: 30px;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .page-heading {
          font-size: 30px;
          font-weight: bold;
          color: rgb(0, 1, 1);
          margin-bottom: 20px;
        }

        .search-bar {
          margin-bottom: 20px;
        }

        .search-input {
          width: 300px;
          padding: 10px;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .subscriber-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .subscriber-item {
          display: flex;
          align-items: center;
          background-color: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .subscriber-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        }

        .subscriber-item .subscriber-info {
          margin-left: 20px;
          text-align: left;
        }

        .subscriber-item h3 {
          font-size: 22px;
          color: #333;
          margin: 0;
        }

        .loading-text {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .error-message {
          color: red;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }

        .no-subscribers {
          color: #888;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default SubscriberPage;
