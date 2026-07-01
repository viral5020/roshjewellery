import React, { useState, useEffect } from 'react';
import ProductImageUpload from "@/components/admin-view/image-upload";

// Function to fetch categories asynchronously
async function fetchCategories() {
  const response = await fetch('/api/categories');
  const data = await response.json();
  return data.categories || [];
}

// Function to fetch subcategories based on selected category
async function fetchSubcategoriesByCategory(categoryId) {
  const response = await fetch(`/api/subcategories/category/${categoryId}`);
  const data = await response.json();
  return data.subCategories || [];
}

// Function to delete a subcategory by ID
async function deleteSubCategory(id) {
  const response = await fetch(`/api/subcategories/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Function to update subcategory
async function updateSubCategory(id, name, category, sizeChartImage, image) {
  const response = await fetch(`/api/subcategories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, category, sizeChartImage, image }),
  });
  return response.json();
}

const SubCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState(null);
  const [sizeChartFile, setSizeChartFile] = useState(null);
  const [uploadedSizeChartUrl, setUploadedSizeChartUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const categoryData = await fetchCategories();
        setCategories(categoryData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Error fetching categories');
        console.error(err);
      }
    };

    fetchCategoryData();
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    const fetchSubCategoryData = async () => {
      if (selectedCategory) {
        try {
          setLoading(true);
          const subCategoryData = await fetchSubcategoriesByCategory(selectedCategory);
          setSubCategories(subCategoryData);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setError('Error fetching subcategories');
          console.error(err);
        }
      }
    };

    fetchSubCategoryData();
  }, [selectedCategory]);

  // Handle category selection
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Handle delete subcategory
  const handleDelete = async (id) => {
    try {
      const result = await deleteSubCategory(id);
      if (result.success) {
        setSubCategories(subCategories.filter(sub => sub._id !== id));
      } else {
        setError('Failed to delete subcategory');
      }
    } catch (err) {
      setError('Error deleting subcategory');
    }
  };

  // Handle edit subcategory
  const handleEdit = (subCategory) => {
    setIsEditing(true);
    setEditSubCategory(subCategory);
    setUploadedSizeChartUrl(subCategory.sizeChartImage || "");
    setSizeChartFile(null);
    setUploadedImageUrl(subCategory.image || "");
    setImageFile(null);
  };

  // Handle update subcategory
  const handleUpdate = async (event) => {
    event.preventDefault();
    const { name, category } = event.target;
    try {
      const result = await updateSubCategory(editSubCategory._id, name.value, category.value, uploadedSizeChartUrl, uploadedImageUrl);
      if (result.success) {
        setSubCategories(subCategories.map(sub => (sub._id === editSubCategory._id ? result.subCategory : sub)));
        setIsEditing(false);
        setEditSubCategory(null);
        setUploadedSizeChartUrl("");
        setSizeChartFile(null);
        setUploadedImageUrl("");
        setImageFile(null);
      } else {
        setError('Failed to update subcategory');
      }
    } catch (err) {
      setError('Error updating subcategory');
    }
  };

  // Inline styles
  const containerStyle = {
    padding: '40px',
    fontFamily: 'Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f4f7fb',
    borderRadius: '8px',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
  };

  const errorMessageStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: '1.1rem',
    marginBottom: '20px',
  };

  const categorySelectStyle = {
    marginBottom: '30px',
  };

  const categorySelectLabelStyle = {
    fontSize: '1.2rem',
    color: '#333',
    display: 'block',
    marginBottom: '8px',
  };

  const selectStyle = {
    padding: '12px',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '300px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
    marginTop: '8px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thStyle = {
    padding: '15px',
    textAlign: 'left',
    backgroundColor: '#2C3E50',
    color: 'white',
    fontSize: '1.1rem',
  };

  const tdStyle = {
    padding: '15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    fontSize: '1rem',
  };

  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '5px',
    border: 'none',
    transition: 'background-color 0.3s ease',
    marginRight: '10px',
    marginBottom: '10px',
  };

  const editButtonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
  };

  const deleteButtonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
  };

  const modalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const modalContentStyle = {
    backgroundColor: '#fff',
    padding: '30px',
    width: '600px', // slightly wider for image upload
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '8px',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
  };

  const modalHeaderStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.5rem',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    outline: 'none',
  };

  const submitButtonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    width: '100%',
    padding: '14px',
    cursor: 'pointer',
    borderRadius: '6px',
  };

  const cancelButtonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    width: '100%',
    padding: '14px',
    cursor: 'pointer',
    borderRadius: '6px',
    marginTop: '10px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2.2rem', color: '#2C3E50', marginBottom: '30px' }}>📁 Manage Subcategories</h1>

      {error && <p style={errorMessageStyle}>{error}</p>}

      {/* Category selection dropdown */}
      <div style={categorySelectStyle}>
        <label htmlFor="category" style={categorySelectLabelStyle}>Select Category: </label>
        <select
          id="category"
          name="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={selectStyle}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {subCategories.length === 0 ? (
            <p>No subcategories found for this category.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  {/* <th style={thStyle}>ID</th> */}
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.map((sub) => (
                  <tr key={sub._id}>
                    {/* <td style={tdStyle}>{sub._id}</td> */}
                    <td style={tdStyle}>{sub.name}</td>
                    <td style={tdStyle}>
                      <button
                        style={{ ...buttonStyle, ...editButtonStyle }}
                        onClick={() => handleEdit(sub)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...buttonStyle, ...deleteButtonStyle }}
                        onClick={() => handleDelete(sub._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Edit Subcategory Modal/Popup */}
      {isEditing && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3 style={modalHeaderStyle}>Edit Subcategory</h3>
            <form onSubmit={handleUpdate}>
              <div>
                <label htmlFor="name">Subcategory Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editSubCategory.name}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editSubCategory.category}
                  required
                  style={inputStyle}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "20px", marginTop: "20px" }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subcategory Image (Optional)</label>
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                  <ProductImageUpload
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                    uploadedImageUrl={uploadedImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    setImageLoadingState={setImageLoadingState}
                    imageLoadingState={imageLoadingState}
                    isEditMode={!!uploadedImageUrl}
                    showSubImages={false}
                    label="Subcategory Image"
                  />
                </div>
                
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Size Chart Image (Optional)</label>
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
                  <ProductImageUpload
                    imageFile={sizeChartFile}
                    setImageFile={setSizeChartFile}
                    uploadedImageUrl={uploadedSizeChartUrl}
                    setUploadedImageUrl={setUploadedSizeChartUrl}
                    setImageLoadingState={setImageLoadingState}
                    imageLoadingState={imageLoadingState}
                    isEditMode={!!uploadedSizeChartUrl}
                    showSubImages={false}
                    label="Size Chart Image"
                  />
                </div>
              </div>
              <button style={submitButtonStyle} type="submit" disabled={imageLoadingState}>Update</button>
              <button
                style={cancelButtonStyle}
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryPage;
