import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast"; // Importing the toast notification for error handling
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductImageUpload from "@/components/admin-view/image-upload"; // Assuming this component handles image upload
import { Pencil, Trash2 } from "lucide-react";

const initialCategoryFormData = {
  name: "",
  image: null,
};

function Category() {
  const [categories, setCategories] = useState([]); // State for categories
  const [filteredCategories, setFilteredCategories] = useState([]); // State for filtered categories
  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] = useState(false); // Modal visibility
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryFormData); // Category form data
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // Store uploaded image URL
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } else {
        throw new Error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error fetching categories",
        description: error.message || "An error occurred while fetching categories",
        variant: "destructive",
      });
    }
  };

  // Handle category form submission
  const onCategorySubmit = async (event) => {
    event.preventDefault();

    const categoryData = {
      ...categoryFormData,
      image: uploadedImageUrl,
    };

    try {
      const response = await fetch(
        editingCategoryId
          ? `/api/categories/${editingCategoryId}`
          : "/api/categories/create",
        {
          method: editingCategoryId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      const data = await response.json();

      if (data.success || data.message === "Category updated successfully") {
        setOpenCreateCategoryDialog(false);
        setOpenEditCategoryDialog(false);
        setCategoryFormData(initialCategoryFormData);
        setUploadedImageUrl("");
        setEditingCategoryId(null);
        toast({
          title: editingCategoryId ? "Category updated successfully" : "Category created successfully",
        });
        getCategories();
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      toast({
        title: editingCategoryId ? "Error updating category" : "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryFormData({
      name: category.name,
      image: category.image,
    });
    setUploadedImageUrl(category.image);
    setOpenEditCategoryDialog(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Category deleted successfully",
          });
          getCategories();
        } else if (data.productCount) {
          // Show detailed error message with product list
          const productList = data.products
            .map(p => `- ${p.title}`)
            .join('\n');
          
          toast({
            title: "Cannot Delete Category",
            description: (
              <div>
                <p>This category has {data.productCount} associated products that must be deleted first:</p>
                <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
                  {productList}
                </pre>
              </div>
            ),
            variant: "destructive",
          });
        } else {
          throw new Error(data.message || "Failed to delete category");
        }
      } catch (error) {
        toast({
          title: "Error deleting category",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    const searchQuery = event.target.value;
    setSearchTerm(searchQuery);

    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  return (
    <div className="mb-5 w-full flex flex-col items-center">
      {/* Search Bar and Create Button */}
      <div className="w-full flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border rounded-md"
        />
        <Button onClick={() => setOpenCreateCategoryDialog(true)}>
          Create New Category
        </Button>
      </div>

      {/* Display categories */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 w-full">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category._id} className="card p-4 border shadow-md rounded-md text-center relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCategory(category)}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCategory(category._id)}
                  className="hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover rounded-md mb-3"
              />
              <h3 className="font-semibold text-lg">{category.name}</h3>
            </div>
          ))
        ) : (
          <p>No categories available.</p>
        )}
      </div>

      {/* Create Category Dialog */}
      <Sheet open={openCreateCategoryDialog} onOpenChange={() => setOpenCreateCategoryDialog(false)}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFile={null}
            setImageFile={() => {}}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={() => {}}
            imageLoadingState={false}
            isEditMode={false}
          />

          <div className="py-6">
            <form onSubmit={onCategorySubmit}>
              <div className="mb-4">
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  required
                  className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter category name"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={!categoryFormData.name || !uploadedImageUrl}>
                  Add Category
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Dialog */}
      <Sheet open={openEditCategoryDialog} onOpenChange={() => setOpenEditCategoryDialog(false)}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFile={null}
            setImageFile={() => {}}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={() => {}}
            imageLoadingState={false}
            isEditMode={true}
          />

          <div className="py-6">
            <form onSubmit={onCategorySubmit}>
              <div className="mb-4">
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  required
                  className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter category name"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={!categoryFormData.name || !uploadedImageUrl}>
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Category;
