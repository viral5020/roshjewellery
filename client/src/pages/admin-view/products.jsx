import ProductImageUpload from "@/components/admin-view/image-upload";
import ProductVideoUpload from "@/components/admin-view/video-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements, SubcategoryElement } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { fetchMetalPrices } from "@/store/admin/metal-price-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { X } from "lucide-react";
import axios from "axios";

// Initial form data
const initialFormData = {
  image: null,
  subImages: [],
  title: "",
  description: "",
  category: "",
  subcategory: "",
  totalStock: "",
  averageReview: 0,
  metalType: "",
  purity: "",
  labourCost: "",
  diamondType: "",
  gramWeight: "",
  diamondCarat: "",
  diamondPrice: "",
  diamondPerCaratPrice: "",
  diamondColor: "",
  diamondClarity: "",
  colors: [],
  colorImages: [],
  video: "",
};

const initialCategoryFormData = {
  name: "",
  image: null,
};

const initialSubCategoryFormData = {
  name: "",
  category: "",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] = useState(false);
  const [openCreateSubCategoryDialog, setOpenCreateSubCategoryDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(initialFormData);
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryFormData);
  const [subCategoryFormData, setSubCategoryFormData] = useState(initialSubCategoryFormData);

  const [uploadedSubSizeChartUrl, setUploadedSubSizeChartUrl] = useState("");
  const [subSizeChartFile, setSubSizeChartFile] = useState(null);
  const [subSizeChartLoading, setSubSizeChartLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [colorImageUploading, setColorImageUploading] = useState({});

  const goldColors = [
    { id: "rose-gold", label: "Rose Gold" },
    { id: "white-gold", label: "White Gold" },
    { id: "yellow-gold", label: "Yellow Gold" },
  ];

  const silverColors = [
    { id: "silver-polished", label: "Silver Polished" },
    { id: "yellow-polished", label: "Yellow Polished" },
    { id: "rose-gold-polished", label: "Rose Gold Polished" },
  ];

  const availableColors = formData.metalType === "gold"
    ? goldColors
    : formData.metalType === "silver"
      ? silverColors
      : [];

  // Clear colors and colorImages when metalType changes
  useEffect(() => {
    if (formData.metalType) {
      const isGold = formData.metalType === "gold";
      const validColorIds = isGold 
        ? ["rose-gold", "white-gold", "yellow-gold"]
        : ["silver-polished", "yellow-polished", "rose-gold-polished"];
        
      const currentColors = Array.isArray(formData.colors) ? formData.colors : [];
      const currentImages = Array.isArray(formData.colorImages) ? formData.colorImages : [];
      
      const filteredColors = currentColors.filter(c => validColorIds.includes(c));
      const filteredImages = currentImages.filter(ci => validColorIds.includes(ci.color));
      
      if(
        filteredColors.length !== currentColors.length ||
        filteredImages.length !== currentImages.length
      ) {
        setFormData(prev => ({
          ...prev,
          colors: filteredColors,
          colorImages: filteredImages
        }));
      }
    } else {
      if(
        (Array.isArray(formData.colors) && formData.colors.length > 0) ||
        (Array.isArray(formData.colorImages) && formData.colorImages.length > 0)
      ) {
        setFormData(prev => ({
          ...prev,
          colors: [],
          colorImages: []
        }));
      }
    }
  }, [formData.metalType]);

  // Reset purity if it becomes invalid when metal type changes
  useEffect(() => {
    let validOptions = [];
    if (formData.metalType === "gold") {
      validOptions = ["24K", "22K", "21K", "20K", "18K", "14K", "10K", "9K"];
    } else if (formData.metalType === "silver") {
      validOptions = ["999", "958", "950", "925", "900", "835", "800"];
    }
    
    if (formData.purity && !validOptions.includes(formData.purity)) {
      setFormData(prev => ({ ...prev, purity: "" }));
    }
  }, [formData.metalType, formData.purity]);

  async function handleColorImageUpload(file, color) {
    setColorImageUploading(prev => ({ ...prev, [color]: true }));
    try {
      const data = new FormData();
      data.append("my_file", file);
      const response = await axios.post(
        "/api/admin/products/upload-image",
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response?.data?.success) {
        setFormData(prev => {
          const colorImages = prev.colorImages ? [...prev.colorImages] : [];
          const existingIdx = colorImages.findIndex(ci => ci.color === color);
          if (existingIdx > -1) {
            colorImages[existingIdx] = { color, image: response.data.result.url };
          } else {
            colorImages.push({ color, image: response.data.result.url });
          }
          return { ...prev, colorImages };
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload image for color: " + color);
    } finally {
      setColorImageUploading(prev => ({ ...prev, [color]: false }));
    }
  }

  const { productList } = useSelector((state) => state.adminProducts);
  const { diamondPricePerCarat } = useSelector((state) => state.metalPrice);
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Auto-calculate diamond price based on carats and form's price per carat
  useEffect(() => {
    if (formData.diamondCarat && formData.diamondPerCaratPrice) {
      const carat = parseFloat(formData.diamondCarat);
      const pricePerCarat = parseFloat(formData.diamondPerCaratPrice);
      if (!isNaN(carat) && !isNaN(pricePerCarat)) {
        const calculatedPrice = (carat * pricePerCarat).toFixed(2);
        if (formData.diamondPrice !== calculatedPrice && formData.diamondPrice !== calculatedPrice.toString()) {
          setFormData(prev => ({
            ...prev,
            diamondPrice: calculatedPrice.toString()
          }));
        }
      }
    }
  }, [formData.diamondCarat, formData.diamondPerCaratPrice]);
  

  // Function to fetch and update category options
  const fetchAndUpdateCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        const categoryOptions = data.categories.map(cat => ({
          id: cat._id,
          label: cat.name
        }));
        
        // Create a new array to trigger re-render
        const updatedFormElements = [...addProductFormElements];
        updatedFormElements[2] = {
          ...updatedFormElements[2],
          options: categoryOptions
        };
        
        // Update the form elements
        addProductFormElements.splice(0, addProductFormElements.length, ...updatedFormElements);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchMetalPrices());
    fetchAndUpdateCategories();
  }, [dispatch]);

  // Initialize form data when editing
  useEffect(() => {
    if (currentEditedId) {
      const product = productList.find(p => p._id === currentEditedId);
      if (product) {
        // Fetch subcategories for the product's category
        fetchSubcategories(product.category);
        
        // Set form data with proper structure
        const formattedProduct = {
          title: product.title || "",
          description: product.description || "",
          category: product.category || "",
          subcategory: product.subcategory || "",
          totalStock: product.totalStock?.toString() || "",
          image: product.image || "",
          subImages: Array.isArray(product.subImages) ? product.subImages : [],
          averageReview: product.averageReview || 0,
          metalType: product.metalType || "",
          purity: product.purity || "",
          labourCost: product.labourCost?.toString() || "",
          diamondType: product.diamondType || "",
          gramWeight: product.gramWeight?.toString() || "",
          diamondCarat: product.diamondCarat?.toString() || "",
          diamondPerCaratPrice: product.diamondPerCaratPrice?.toString() || "",
          diamondPrice: product.diamondPrice?.toString() || "",
          diamondColor: product.diamondColor || "",
          diamondClarity: product.diamondClarity || "",
          colors: Array.isArray(product.colors) ? product.colors : [],
          colorImages: Array.isArray(product.colorImages) ? product.colorImages : [],
          video: product.video || "",
        };
        
        console.log('Setting form data:', formattedProduct); // Debug log
        
        setFormData(formattedProduct);
        setSubImages(Array.isArray(product.subImages) ? product.subImages : []);
        setUploadedImageUrl(product.image || "");
        setUploadedVideoUrl(product.video || "");
      }
    }
  }, [currentEditedId, productList]);

  // Function to fetch subcategories for a selected category
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const response = await fetch(`/api/subcategories/category/${categoryId}`);
      const data = await response.json();
      if (data.success) {
        const subcategoryOptions = data.subCategories.map(subcat => ({
          id: subcat._id,
          label: subcat.name
        }));
        setSubcategories(subcategoryOptions);
        // Update the subcategory options in the form
        addProductFormElements[3].options = subcategoryOptions;
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subcategories",
        variant: "destructive"
      });
    }
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, category: categoryId, subcategory: "" }));
    fetchSubcategories(categoryId);
  };

  function onSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Ensure subImages is an array
    const subImagesArray = Array.isArray(subImages) ? subImages : [];

    const productData = {
      ...formData,
      image: uploadedImageUrl,
      subImages: subImagesArray, // Ensure subImages is included as an array
      video: uploadedVideoUrl || "",
      totalStock: parseInt(formData.totalStock) || 0,
      gramWeight: parseFloat(formData.gramWeight) || 0,
      labourCost: parseFloat(formData.labourCost) || 0,
      diamondCarat: parseFloat(formData.diamondCarat) || 0,
      diamondPerCaratPrice: parseFloat(formData.diamondPerCaratPrice) || 0,
      diamondPrice: parseFloat(formData.diamondPrice) || 0,
      diamondClarity: formData.diamondClarity,
    };

    console.log('Submitting product data:', productData); // Debug log

    if (currentEditedId !== null) {
      dispatch(editProduct({ id: currentEditedId, formData: productData }))
        .then((data) => {
          setIsSubmitting(false);
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setSubImages([]);
            setUploadedImageUrl("");
            setUploadedVideoUrl("");
            toast({ title: "Product updated successfully" });
          }
        });
    } else {
      dispatch(addNewProduct(productData))
        .then((data) => {
          setIsSubmitting(false);
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            setSubImages([]);
            setUploadedImageUrl("");
            setUploadedVideoUrl("");
            toast({ title: "Product added successfully" });
          }
        });
    }
  }

  function handleDelete(id) {
    dispatch(deleteProduct(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function handleToggleStatus(id, field, value) {
    dispatch(
      editProduct({
        id,
        formData: { [field]: value },
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({
          title: "Product updated successfully",
        });
      }
    });
  }

  function isFormValid() {
    const requiredFields = ["title", "description", "category", "subcategory", "gramWeight"];
    const textFieldsValid = requiredFields.every((key) => {
      return formData[key] !== "" && formData[key] !== null && formData[key] !== undefined;
    });
    return textFieldsValid && uploadedImageUrl !== "";
  }

  function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      toast({ 
        title: "Invalid file format",
        description: "Please upload a CSV file"
      });
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "string" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required fields
        const requiredFields = ['title', 'description', 'category', 'subcategory', 'brand', 'price', 'totalStock'];
        const invalidRows = jsonData.filter(row => 
          requiredFields.some(field => !row[field])
        );

        if (invalidRows.length > 0) {
          toast({
            title: "Invalid data",
            description: "Some rows are missing required fields"
          });
          return;
        }

        // Fetch all categories first
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.categories || [];

        // Create a map of category names to IDs
        const categoryMap = {};
        categories.forEach(cat => {
          categoryMap[cat.name.toLowerCase()] = cat._id;
        });

        // Fetch existing products to check for duplicates
        const existingProductsResponse = await fetch('/api/admin/products/get');
        const existingProductsData = await existingProductsResponse.json();
        const existingProducts = existingProductsData.data || [];

        // Process each row
        const uploadPromises = jsonData.map(async product => {
          // Convert numeric fields
          const processedProduct = {
            ...product,
            price: parseFloat(product.price) || 0,
            salePrice: parseFloat(product.salePrice) || 0,
            totalStock: parseInt(product.totalStock) || 0,
            averageReview: 0,
            subImages: []
          };

          // Convert category name to ID
          const categoryName = product.category.toString().toLowerCase();
          const categoryId = categoryMap[categoryName];
          
          if (!categoryId) {
            throw new Error(`Invalid category: ${product.category}`);
          }
          
          processedProduct.category = categoryId;

          // Fetch subcategories for this category
          const subcategoriesResponse = await fetch(`/api/subcategories/category/${categoryId}`);
          const subcategoriesData = await subcategoriesResponse.json();
          const subcategories = subcategoriesData.subCategories || [];

          // Find matching subcategory
          const subcategoryName = product.subcategory.toString().toLowerCase();
          const subcategory = subcategories.find(sub => sub.name.toLowerCase() === subcategoryName);
          
          if (!subcategory) {
            throw new Error(`Invalid subcategory: ${product.subcategory} for category: ${product.category}`);
          }
          
          processedProduct.subcategory = subcategory._id;

          // Check if product already exists
          const existingProduct = existingProducts.find(ep => 
            ep.title.toLowerCase() === processedProduct.title.toLowerCase() &&
            ep.brand.toLowerCase() === processedProduct.brand.toLowerCase() &&
            ep.category.toLowerCase() === categoryName &&
            ep.subcategory.toLowerCase() === subcategoryName
          );

          if (existingProduct) {
            // Replace stock with the value from CSV
            return dispatch(editProduct({ 
              id: existingProduct._id, 
              formData: { 
                ...existingProduct, 
                totalStock: processedProduct.totalStock,
                price: processedProduct.price,
                salePrice: processedProduct.salePrice
              }
            }));
          } else {
            // Create new product
            return dispatch(addNewProduct(processedProduct));
          }
        });

        // Handle all uploads
        Promise.all(uploadPromises)
          .then(results => {
            const successCount = results.filter(r => r?.payload?.success).length;
            dispatch(fetchAllProducts());
            toast({ 
              title: "Upload complete",
              description: `Successfully processed ${successCount} out of ${jsonData.length} products`
            });
          })
          .catch(error => {
            console.error('Error uploading products:', error);
            toast({
              title: "Upload failed",
              description: error.message || "There was an error uploading the products"
            });
          });
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast({
          title: "Error processing file",
          description: error.message || "Could not process the CSV file. Please check the format."
        });
      }
    };
    reader.onerror = function() {
      toast({
        title: "Error reading file",
        description: "Could not read the CSV file"
      });
    };
    reader.readAsText(file);
  }

  function handleCsvDownload() {
    const worksheet = XLSX.utils.json_to_sheet(productList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const csvOutput = XLSX.write(workbook, { bookType: "csv", type: "binary" });
    const blob = new Blob([csvOutput], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "products.csv";
    link.click();
  }

  function onCategorySubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const categoryData = {
      ...categoryFormData,
      image: uploadedImageUrl,
    };

    fetch("/api/categories/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Fetch updated categories
          return fetch("/api/categories")
            .then(res => res.json())
            .then(categoriesData => {
              if (categoriesData.success) {
                // Update the category options in the form
                const categoryOptions = categoriesData.categories.map(cat => ({
                  id: cat._id,
                  label: cat.name
                }));
                
                // Create a new array to trigger re-render
                const updatedFormElements = [...addProductFormElements];
                updatedFormElements[2] = {
                  ...updatedFormElements[2],
                  options: categoryOptions
                };
                
                // Update the form elements
                addProductFormElements.splice(0, addProductFormElements.length, ...updatedFormElements);
                
                // Set the newly created category as selected
                setFormData(prev => ({
                  ...prev,
                  category: data.category._id
                }));
              }
              return data;
            });
        }
        return data;
      })
      .then((data) => {
        toast({
          title: data.success ? "Category created successfully" : "Error creating category",
          description: data.message,
        });
        if (data.success) {
          setOpenCreateCategoryDialog(false);
          setCategoryFormData(initialCategoryFormData);
          setUploadedImageUrl("");
          setImageFile(null);
        }
      })
      .catch((err) =>
        toast({ title: "Error creating category", description: err.message })
      )
      .finally(() => setIsSubmitting(false));
  }

  // Handle subcategory form submission
  const onSubCategorySubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!subCategoryFormData.name || !subCategoryFormData.category) {
      toast({
        title: "Error",
        description: "Please provide both subcategory name and category.",
      });
      return;
    }

    setIsSubmitting(true);

    fetch("/api/subcategories/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...subCategoryFormData,
        sizeChartImage: uploadedSubSizeChartUrl
      }), // Sends name, category, sizeChartImage
    })
      .then((res) => res.json())
      .then((data) => {
        toast({
          title: data.success ? "Subcategory created successfully" : "Error creating subcategory",
          description: data.message,
        });
        if (data.success) {
          setOpenCreateSubCategoryDialog(false);
          setSubCategoryFormData(initialSubCategoryFormData);
          setUploadedSubSizeChartUrl("");
          setSubSizeChartFile(null);
        }
      })
      .catch((err) => {
        toast({
          title: "Error creating subcategory",
          description: err.message,
        });
      })
      .finally(() => setIsSubmitting(false));
  };


  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end items-center">
        <Button onClick={() => document.getElementById("csv-upload").click()} className="pr-4">
          Upload CSV
        </Button>
        <span className="mx-4 border-l border-gray-400 h-6"></span>
        <Button onClick={handleCsvDownload} className="px-4">
          Download CSV
        </Button>
        <span className="mx-4 border-l border-gray-400 h-6"></span>
        <Button onClick={() => setOpenCreateCategoryDialog(true)} className="px-4">
          Create Category
        </Button>
        <span className="mx-4 border-l border-gray-400 h-6"></span> 

        
        <Button onClick={() => setOpenCreateSubCategoryDialog(true)} className="px-4">
          Create SubCategory
        </Button>
        <span className="mx-4 border-l border-gray-400 h-6"></span>
        <Button onClick={() => setOpenCreateProductsDialog(true)} className="px-4">
          Add New Product
        </Button>
        <input
          type="file"
          id="csv-upload"
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleCsvUpload}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0 ? (
          productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              product={productItem}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              handleDelete={handleDelete}
              setSubImages={setSubImages}
              handleToggleStatus={handleToggleStatus}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No products found.
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setSubImages([]);
          setUploadedVideoUrl("");
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>{currentEditedId ? "Edit Product" : "Add New Product"}</SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            setSubImages={setSubImages}
            subImages={subImages}
          />
          <ProductVideoUpload
            uploadedVideoUrl={uploadedVideoUrl}
            setUploadedVideoUrl={setUploadedVideoUrl}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId ? "Edit" : "Add"}
              formControls={addProductFormElements.map(el => {
                if (el.name === "purity") {
                  if (formData.metalType === "gold") {
                    return {
                      ...el,
                      options: [
                        { id: "24K", label: "24K (99.9%)" },
                        { id: "22K", label: "22K (91.7%)" },
                        { id: "21K", label: "21K (87.5%)" },
                        { id: "20K", label: "20K (83.3%)" },
                        { id: "18K", label: "18K (75.0%)" },
                        { id: "14K", label: "14K (58.5%)" },
                        { id: "10K", label: "10K (41.7%)" },
                        { id: "9K", label: "9K (37.5%)" },
                      ]
                    };
                  } else if (formData.metalType === "silver") {
                    return {
                      ...el,
                      options: [
                        { id: "999", label: "999 (99.9%)" },
                        { id: "958", label: "958 (95.8%)" },
                        { id: "950", label: "950 (95.0%)" },
                        { id: "925", label: "925 (92.5%)" },
                        { id: "900", label: "900 (90.0%)" },
                        { id: "835", label: "835 (83.5%)" },
                        { id: "800", label: "800 (80.0%)" },
                      ]
                    };
                  } else {
                    return { ...el, options: [] };
                  }
                }
                return el;
              })}
              isBtnDisabled={!isFormValid() || isSubmitting}
              onCategoryChange={handleCategoryChange}
              onAddCategory={() => setOpenCreateCategoryDialog(true)}
            >
              {/* Color Variations — shown only when Metal Type is selected */}
              {availableColors.length > 0 && (
                <div className="grid w-full gap-1.5">
                  <label className="text-sm font-medium mb-1">
                    Color Variations
                    <span className="text-xs text-muted-foreground ml-2">(optional, select all that apply &amp; upload an image per color)</span>
                  </label>
                  <div className="space-y-3">
                    {availableColors.map((color) => {
                      const isSelected = Array.isArray(formData.colors) && formData.colors.includes(color.id);
                      const uploadedImg = Array.isArray(formData.colorImages)
                        ? formData.colorImages.find(ci => ci.color === color.id)?.image
                        : null;

                      return (
                        <div
                          key={color.id}
                          className={`rounded-lg border p-3 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          {/* Checkbox row */}
                          <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-primary"
                              checked={isSelected}
                              onChange={() => {
                                const prev = Array.isArray(formData.colors) ? formData.colors : [];
                                const next = prev.includes(color.id)
                                  ? prev.filter(c => c !== color.id)
                                  : [...prev, color.id];
                                // Also remove colorImage entry if deselecting
                                const prevImgs = Array.isArray(formData.colorImages) ? formData.colorImages : [];
                                const nextImgs = next.includes(color.id)
                                  ? prevImgs
                                  : prevImgs.filter(ci => ci.color !== color.id);
                                setFormData(f => ({ ...f, colors: next, colorImages: nextImgs }));
                              }}
                            />
                            <span className="font-medium text-sm">{color.label}</span>
                          </label>

                          {/* Image uploader — shown only when this color is selected */}
                          {isSelected && (
                            <div className="flex items-center gap-3 mt-1">
                              {uploadedImg ? (
                                <div className="relative w-20 h-20">
                                  <img
                                    src={uploadedImg}
                                    alt={color.label}
                                    className="w-20 h-20 rounded-md object-cover border"
                                  />
                                  <button
                                    type="button"
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    onClick={() => {
                                      setFormData(f => ({
                                        ...f,
                                        colorImages: (f.colorImages || []).filter(ci => ci.color !== color.id)
                                      }));
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : colorImageUploading[color.id] ? (
                                <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted text-xs text-muted-foreground">
                                  Uploading…
                                </div>
                              ) : (
                                <label
                                  htmlFor={`color-img-${color.id}`}
                                  className="w-20 h-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                >
                                  <span className="text-xl leading-none">+</span>
                                  <span className="text-xs mt-1">Upload</span>
                                  <input
                                    id={`color-img-${color.id}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleColorImageUpload(file, color.id);
                                    }}
                                  />
                                </label>
                              )}
                              {uploadedImg && (
                                <span className="text-xs text-green-600 font-medium">Image uploaded ✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CommonForm>
          </div>
        </SheetContent>
      </Sheet>

      {/* Category Dialog */}
      <Sheet
        open={openCreateCategoryDialog}
        onOpenChange={() => {
          setOpenCreateCategoryDialog(false);
          setCategoryFormData(initialCategoryFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={false}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onCategorySubmit}
              formData={categoryFormData}
              setFormData={setCategoryFormData}
              buttonText="Add Category"
              formControls={[
                {
                  label: "Category Name",
                  name: "name",
                  type: "text",
                  value: categoryFormData.name,
                  onChange: (e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value }),
                },
              ]}
              isBtnDisabled={categoryFormData.name === "" || isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* 🆕 SubCategory Dialog */}
      <Sheet
  open={openCreateSubCategoryDialog}
  onOpenChange={() => {
    setOpenCreateSubCategoryDialog(false);
    setSubCategoryFormData(initialSubCategoryFormData);
    setUploadedSubSizeChartUrl("");
    setSubSizeChartFile(null);
  }}
>
  <SheetContent side="right" className="overflow-auto">
    <SheetHeader>
      <SheetTitle>Create New SubCategory</SheetTitle>
    </SheetHeader>
    <div className="py-6">
      {/* Log the subCategoryFormData here to check the values */}
      {console.log(subCategoryFormData)}

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Size Chart Image (Optional)</label>
        <ProductImageUpload
          imageFile={subSizeChartFile}
          setImageFile={setSubSizeChartFile}
          uploadedImageUrl={uploadedSubSizeChartUrl}
          setUploadedImageUrl={setUploadedSubSizeChartUrl}
          setImageLoadingState={setSubSizeChartLoading}
          imageLoadingState={subSizeChartLoading}
          isEditMode={!!uploadedSubSizeChartUrl}
          showSubImages={false}
          label="Size Chart Image"
        />
      </div>

      <CommonForm
        onSubmit={onSubCategorySubmit}
        formData={subCategoryFormData}
        setFormData={setSubCategoryFormData}
        buttonText="Add SubCategory"
        formControls={SubcategoryElement}
        isBtnDisabled={isSubmitting}
      />
    </div>
  </SheetContent>
</Sheet>

    </Fragment>
  );
}

export default AdminProducts;
