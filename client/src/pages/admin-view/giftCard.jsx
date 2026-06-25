import React, { useState, useEffect } from 'react';
import { Gift, CreditCard } from 'lucide-react'; // Import the required icons

const CreateGiftCardPage = () => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    expiryDate: '',
    status: 'active',
    maxUsageLimit: 1,
    minPurchaseAmount: 0,
    category: '',
    product: '',
    isUserSpecific: false,
    userId: '',
    isFirstOrderOnly: false,
    paymentMethodDiscount: 0,
    paymentMethodDiscountType: 'percentage', // 'percentage' or 'fixed'
    eligiblePaymentMethods: ['razorpay', 'cod'], // Default to both payment methods
    freeShipping: false,
  });

  const [giftCards, setGiftCards] = useState([]); // Store gift cards fetched from the backend
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGiftCardId, setEditingGiftCardId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [giftCardToDelete, setGiftCardToDelete] = useState(null);

  // Add resetForm function
  const resetForm = () => {
    setFormData({
      code: generateUniqueCode(),
      description: '',
      expiryDate: '',
      status: 'active',
      maxUsageLimit: 1,
      minPurchaseAmount: 0,
      category: '',
      product: '',
      isUserSpecific: false,
      userId: '',
      isFirstOrderOnly: false,
      paymentMethodDiscount: 0,
      paymentMethodDiscountType: 'percentage',
      eligiblePaymentMethods: ['razorpay', 'cod'],
      freeShipping: false,
    });
    setError(null);
    setSuccessMessage(null);
  };

  // Fetch gift cards when component mounts
  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        console.log('Fetching gift cards...');
        const response = await fetch('/api/giftcards', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include' // Include cookies in the request
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received gift cards data:', data);

        if (response.ok) {
          if (Array.isArray(data)) {
            setGiftCards(data);
            console.log('Successfully set gift cards:', data);
          } else {
            console.error('Received non-array data:', data);
            setError('Invalid data format received');
          }
        } else {
          console.error('Failed to fetch gift cards:', data.message);
          setError(data.message || 'Failed to load gift cards');
        }
      } catch (error) {
        console.error('Error fetching gift cards:', error);
        setError('Error loading gift cards. Please try again.');
      }
    };

    fetchGiftCards();
  }, []);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch categories and products when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data.categories || []);
        } else {
          console.error('Failed to fetch categories:', data.message);
          setError('Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error loading categories');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products/get');
        const data = await response.json();
        if (response.ok && data.success) {
          const productsWithDetails = data.data.map(product => ({
            ...product,
            title: product.title || product.name || 'Untitled Product'
          }));
          setProducts(productsWithDetails);
          setFilteredProducts(productsWithDetails); // Set all products as filtered products
        } else {
          console.error('Failed to fetch products:', data.message);
          setError('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error loading products');
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  // Function to generate a unique gift card code
  const generateUniqueCode = () => {
    const prefix = 'GC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
      // Reset product when category changes
      ...(name === 'category' && { product: '' }),
    }));
  };

  const handlePaymentMethodChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      eligiblePaymentMethods: checked
        ? [...prevData.eligiblePaymentMethods, value]
        : prevData.eligiblePaymentMethods.filter(method => method !== value),
    }));
  };

  const handleEdit = (giftCard) => {
    setIsEditMode(true);
    setEditingGiftCardId(giftCard._id);
    setFormData({
      code: giftCard.code,
      description: giftCard.description || '',
      expiryDate: new Date(giftCard.expiryDate).toISOString().split('T')[0],
      status: giftCard.status,
      maxUsageLimit: giftCard.maxUsageLimit,
      minPurchaseAmount: giftCard.minPurchaseAmount,
      category: giftCard.category ? giftCard.category._id : '',
      product: giftCard.product ? giftCard.product._id : '',
      isUserSpecific: giftCard.isUserSpecific,
      userId: giftCard.userId || '',
      isFirstOrderOnly: giftCard.isFirstOrderOnly,
      paymentMethodDiscount: giftCard.paymentMethodDiscount,
      paymentMethodDiscountType: giftCard.paymentMethodDiscountType,
      eligiblePaymentMethods: giftCard.eligiblePaymentMethods || ['razorpay', 'cod'],
      freeShipping: giftCard.freeShipping,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (giftCard) => {
    setGiftCardToDelete(giftCard);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!giftCardToDelete) return;

    try {
      const response = await fetch(`/api/giftcards/${giftCardToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Gift card deleted successfully!');
        setGiftCards(giftCards.filter(card => card._id !== giftCardToDelete._id));
      } else {
        setError(data.message || 'Error deleting gift card');
      }
    } catch (error) {
      setError('Error deleting gift card');
    } finally {
      setShowDeleteConfirm(false);
      setGiftCardToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => {
      if (value === '' || value === undefined || value === null || value === 'none') return null;
      return value;
    };

    // Validate gift card code format
    if (!/^[A-Za-z0-9\-]+$/.test(formData.code)) {
      setError('Gift card code can only contain letters, numbers, and hyphens');
      setIsLoading(false);
      return;
    }

    // Validate expiry date
    if (!formData.expiryDate || new Date(formData.expiryDate) < new Date()) {
      setError('Please select a valid future expiry date');
      setIsLoading(false);
      return;
    }

    const giftCardData = {
      code: formData.code.trim(),
      description: formData.description.trim(),
      expiryDate: formData.expiryDate,
      status: formData.status || 'active',
      maxUsageLimit: Number(formData.maxUsageLimit) || 1,
      minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
      category: formData.category || null,
      product: formData.product || null,
      isUserSpecific: formData.isUserSpecific || false,
      userId: formData.isUserSpecific ? formData.userId : null,
      isFirstOrderOnly: formData.isFirstOrderOnly || false,
      paymentMethodDiscount: Number(formData.paymentMethodDiscount) || 0,
      paymentMethodDiscountType: formData.paymentMethodDiscountType || 'percentage',
      eligiblePaymentMethods: formData.eligiblePaymentMethods || ['razorpay', 'cod'],
      freeShipping: formData.freeShipping || false,
    };

    try {
      const url = isEditMode 
        ? `/api/giftcards/${editingGiftCardId}`
        : '/api/giftcards/create';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(giftCardData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(isEditMode ? 'Gift card updated successfully!' : 'Gift card created successfully!');
        
        if (!isEditMode) {
          // Reset form with empty values
          resetForm();
        }

        // Fetch updated gift cards list
        const updatedResponse = await fetch('/api/giftcards', {
          credentials: 'include'
        });
        const updatedData = await updatedResponse.json();
        if (updatedResponse.ok) {
          setGiftCards(updatedData);
        }

        // Close modal and reset edit mode
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingGiftCardId(null);
      } else {
        setError(data.message || `Error ${isEditMode ? 'updating' : 'creating'} gift card`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Server error, please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form with a unique code when opening modal
  useEffect(() => {
    if (isModalOpen && !isEditMode) {
      // Only reset form when creating a new gift card
      resetForm();
    }
  }, [isModalOpen, isEditMode]);

  // Add a function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingGiftCardId(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCardClick = (giftCard) => {
    const expiryDate = new Date(giftCard.expiryDate).toLocaleDateString();
    const details = `
      Gift Card Details:
      Code: ${giftCard.code}
      Description: ${giftCard.description || 'No description'}
      Expiry Date: ${expiryDate}
      Status: ${giftCard.status}
      Usage: ${giftCard.currentUsageCount}/${giftCard.maxUsageLimit}
      Minimum Purchase: ₹${giftCard.minPurchaseAmount}
      Category: ${giftCard.category ? giftCard.category.name : 'Not specified'}
      Product: ${giftCard.product ? giftCard.product.title : 'Not specified'}
      User Specific: ${giftCard.isUserSpecific ? 'Yes' : 'No'}
      First Order Only: ${giftCard.isFirstOrderOnly ? 'Yes' : 'No'}
      Payment Method Discount: ${giftCard.paymentMethodDiscount}${giftCard.paymentMethodDiscountType === 'percentage' ? '%' : '₹'}
      Eligible Payment Methods: ${giftCard.eligiblePaymentMethods.length > 0 ? giftCard.eligiblePaymentMethods.map(method => 
        method === 'cod' ? 'Cash on Delivery' : 'Razorpay'
      ).join(', ') : 'None'}
      Free Shipping: ${giftCard.freeShipping ? 'Yes' : 'No'}
    `;
    alert(details);
  };

  // Add a refresh function
  const refreshGiftCards = async () => {
    try {
      console.log('Refreshing gift cards...');
      const response = await fetch('/api/giftcards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Refresh response:', data);

      if (response.ok && Array.isArray(data)) {
        setGiftCards(data);
        console.log('Successfully refreshed gift cards');
      } else {
        console.error('Failed to refresh gift cards:', data);
        setError('Failed to refresh gift cards');
      }
    } catch (error) {
      console.error('Error refreshing gift cards:', error);
      setError('Error refreshing gift cards');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Create Gift Card Button and Refresh Button */}
      <div className="flex justify-between mb-6">
        <button
          onClick={refreshGiftCards}
          className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>Refresh</span>
        </button>
        <button
          className="bg-black text-white p-3 rounded-full flex items-center justify-center hover:bg-gray-800 transition duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <Gift size={24} />
        </button>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Gift Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {giftCards.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center">No gift cards created yet.</p>
        ) : (
          giftCards.map((giftCard) => (
            <div
              key={giftCard._id}
              className="relative p-6 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 text-white rounded-xl cursor-pointer overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              {/* Card Content */}
              <div className="relative z-10">
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    giftCard.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {giftCard.status}
                  </span>
                </div>

                {/* Code */}
                <h3 className="font-semibold text-2xl mb-3">Code: {giftCard.code}</h3>

                {/* Description */}
                {giftCard.description && (
                  <p className="mt-2 text-sm opacity-90">Description: {giftCard.description}</p>
                )}

                {/* Expiry Date */}
                <p className="mt-2 text-sm">
                  Expires: {new Date(giftCard.expiryDate).toLocaleDateString()}
                </p>

                {/* Usage */}
                <p className="mt-2 text-sm">
                  Usage: {giftCard.currentUsageCount}/{giftCard.maxUsageLimit}
                </p>

                {/* Minimum Purchase */}
                {giftCard.minPurchaseAmount > 0 && (
                  <p className="mt-2 text-sm">
                    Min. Purchase: ₹{giftCard.minPurchaseAmount}
                  </p>
                )}

                {/* Category and Product */}
                {giftCard.category && (
                  <p className="mt-2 text-sm">
                    Category: {giftCard.category.name}
                  </p>
                )}
                {giftCard.product && (
                  <p className="mt-2 text-sm">
                    Product: {giftCard.product.title}
                  </p>
                )}

                {/* User Specific */}
                {giftCard.isUserSpecific && (
                  <p className="mt-2 text-sm">
                    User Specific: Yes
                  </p>
                )}

                {/* First Order Only */}
                {giftCard.isFirstOrderOnly && (
                  <p className="mt-2 text-sm">
                    First Order Only: Yes
                  </p>
                )}

                {/* Payment Method Discount */}
                {giftCard.paymentMethodDiscount > 0 && (
                  <div className="mt-2 text-sm">
                    <p>Payment Discount: {giftCard.paymentMethodDiscount}{giftCard.paymentMethodDiscountType === 'percentage' ? '%' : '₹'}</p>
                    {giftCard.eligiblePaymentMethods.length > 0 && (
                      <p className="mt-1">
                        Methods: {giftCard.eligiblePaymentMethods.map(method => 
                          method === 'cod' ? 'Cash on Delivery' : 'Razorpay'
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Free Shipping */}
                {giftCard.freeShipping && (
                  <p className="mt-2 text-sm">
                    Free Shipping: Yes
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(giftCard);
                    }}
                    className="px-3 py-1 bg-white text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(giftCard);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this gift card? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating/Editing Gift Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEditMode ? 'Edit Gift Card' : 'Create Gift Card'}
            </h2>

            {/* Close Modal Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Gift Card Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 rounded-md"
                    placeholder="Enter gift card code"
                    required
                    pattern="[A-Za-z0-9\-]+"
                    title="Only letters, numbers, and hyphens are allowed"
                    readOnly={isEditMode}
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, code: generateUniqueCode() }))}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter gift card description"
                  rows="3"
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxUsageLimit" className="block text-sm font-medium text-gray-700">
                  Maximum Usage Limit
                </label>
                <input
                  type="number"
                  id="maxUsageLimit"
                  name="maxUsageLimit"
                  value={formData.maxUsageLimit}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="minPurchaseAmount" className="block text-sm font-medium text-gray-700">
                  Minimum Purchase Amount (₹)
                </label>
                <input
                  type="number"
                  id="minPurchaseAmount"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category (Optional)
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">None</option>
                  <option value="all">All Categories</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                  Product (Optional)
                </label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">None</option>
                  <option value="all">All Products</option>
                  {Array.isArray(products) && products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.title || product.name || 'Untitled Product'}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Specific Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isUserSpecific"
                    name="isUserSpecific"
                    checked={formData.isUserSpecific}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isUserSpecific" className="text-sm font-medium text-gray-700">
                    User Specific Gift Card
                  </label>
                </div>

                {formData.isUserSpecific && (
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                      Select User
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required={formData.isUserSpecific}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* First Order Only */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFirstOrderOnly"
                  name="isFirstOrderOnly"
                  checked={formData.isFirstOrderOnly}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isFirstOrderOnly" className="text-sm font-medium text-gray-700">
                  First Order Only
                </label>
              </div>

              {/* Payment Method Discount */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentMethodDiscountType" className="block text-sm font-medium text-gray-700">
                    Discount Type
                  </label>
                  <select
                    id="paymentMethodDiscountType"
                    name="paymentMethodDiscountType"
                    value={formData.paymentMethodDiscountType}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentMethodDiscount" className="block text-sm font-medium text-gray-700">
                    {formData.paymentMethodDiscountType === 'percentage' ? 'Discount Percentage (%)' : 'Fixed Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    id="paymentMethodDiscount"
                    name="paymentMethodDiscount"
                    value={formData.paymentMethodDiscount}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    min="0"
                    max={formData.paymentMethodDiscountType === 'percentage' ? "100" : undefined}
                    step={formData.paymentMethodDiscountType === 'percentage' ? "1" : "0.01"}
                    required
                  />
                  {formData.paymentMethodDiscountType === 'percentage' && (
                    <p className="text-sm text-gray-500 mt-1">Maximum discount: 100%</p>
                  )}
                  {formData.paymentMethodDiscountType === 'fixed' && (
                    <p className="text-sm text-gray-500 mt-1">Enter the fixed discount amount in ₹</p>
                  )}
                </div>

                {/* Eligible Payment Methods */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Eligible Payment Methods
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={formData.eligiblePaymentMethods.includes('razorpay')}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...formData.eligiblePaymentMethods, 'razorpay']
                            : formData.eligiblePaymentMethods.filter(m => m !== 'razorpay');
                          setFormData({ ...formData, eligiblePaymentMethods: methods });
                        }}
                      />
                      <span className="ml-2">Razorpay</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={formData.eligiblePaymentMethods.includes('cod')}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...formData.eligiblePaymentMethods, 'cod']
                            : formData.eligiblePaymentMethods.filter(m => m !== 'cod');
                          setFormData({ ...formData, eligiblePaymentMethods: methods });
                        }}
                      />
                      <span className="ml-2">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="freeShipping"
                  name="freeShipping"
                  checked={formData.freeShipping}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">
                  Free Shipping
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white p-3 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-800 transition duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <CreditCard /> 
                      <span>{isEditMode ? 'Update Gift Card' : 'Create Gift Card'}</span>
                    </>
                  )}
                </button>
                {successMessage && !isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-700 transition duration-300"
                  >
                    Create Another
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGiftCardPage;
