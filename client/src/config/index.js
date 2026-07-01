// Fetch categories asynchronously from the API
async function fetchCategories() {
  const response = await fetch('/api/categories');
  const data = await response.json();
  console.log(data); // Check the structure of the data
  return data.categories || [];
}

// Fetch subcategories asynchronously from the API
async function fetchSubcategories() {
  const response = await fetch('/api/subcategories');
  const data = await response.json();
  console.log(data); // Check the structure of the data
  return data.subcategories || [];
}

// Function to create category options for select dropdown
async function createCategoryOptions() {
  const categories = await fetchCategories();
  console.log(categories);
  return categories.map(category => ({
    id: category._id,
    label: category.name,
  }));
}

// Function to create subcategory options for select dropdown
async function createSubcategoryOptions() {
  const subcategories = await fetchSubcategories();
  console.log(subcategories);
  return subcategories.map(subcategory => ({
    id: subcategory._id,
    label: subcategory.name,
  }));
}

async function createCategoryOptionsMap() {
  const categories = await fetchCategories();
  // Create a dynamic category map
  const categoryOptionsMap = categories.reduce((acc, category) => {
    acc[category.name.toLowerCase()] = category.name; // Assuming category.name is unique
    return acc;
  }, {});
  return categoryOptionsMap;
}

// Call this function to get the dynamic category options map
createCategoryOptionsMap().then((dynamicCategoryMap) => {
  console.log("Dynamic Category Map: ", dynamicCategoryMap);
  // You can now use the dynamicCategoryMap wherever needed
});

// Static brand options (not fetched from API)
export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

// Register form controls
export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

// Login form controls
export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];


// Subcategory form controls — will be updated dynamically
export const SubcategoryElement = [
  {
    label: "Subcategory Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter subcategory name",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [], // Populate this with category options
  },
];


// Add Product form elements with dynamic category options
export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [],
  },
  {
    label: "Subcategory",
    name: "subcategory",
    componentType: "select",
    options: [],
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
  {
    label: "Metal Type",
    name: "metalType",
    componentType: "select",
    options: [
      { id: "gold", label: "Gold" },
      { id: "silver", label: "Silver" },
    ],
  },
  {
    label: "Purity",
    name: "purity",
    componentType: "select",
    options: [], // Options populated dynamically based on metalType
  },
  {
    label: "Gram Weight",
    name: "gramWeight",
    componentType: "input",
    type: "number",
    placeholder: "Enter gram weight",
  },
  {
    label: "Labour Cost",
    name: "labourCost",
    componentType: "input",
    type: "number",
    placeholder: "Enter labour cost",
  },
  {
    label: "Diamond Type",
    name: "diamondType",
    componentType: "select",
    options: [
      { id: "lab-grown", label: "Lab Grown" },
      { id: "natural", label: "Natural" },
      { id: "without-diamond", label: "Without Diamond" },
    ],
  },
  {
    name: "diamondCaratPriceRow",
    componentType: "row",
    controls: [
      {
        label: "Diamond Carat",
        name: "diamondCarat",
        componentType: "input",
        type: "number",
        placeholder: "Enter diamond carat",
      },
      {
        label: "Per Carat Price",
        name: "diamondPerCaratPrice",
        componentType: "input",
        type: "number",
        placeholder: "Enter price per carat",
      },
    ],
  },
  {
    label: "Diamond Price (Auto-calculated)",
    name: "diamondPrice",
    componentType: "input",
    type: "number",
    placeholder: "Calculated automatically",
  },
  {
    name: "diamondColorClarityRow",
    componentType: "row",
    controls: [
      {
        label: "Diamond Color",
        name: "diamondColor",
        componentType: "select",
        options: [
          { id: "De", label: "De" },
          { id: "Ef", label: "Ef" },
          { id: "Fg", label: "Fg" },
          { id: "Gh", label: "Gh" },
          { id: "Hi", label: "Hi" },
          { id: "Jk", label: "Jk" },
        ],
      },
      {
        label: "Diamond Clarity",
        name: "diamondClarity",
        componentType: "select",
        options: [
          { id: "Vvs vs", label: "Vvs vs" },
          { id: "Vs si", label: "Vs si" },
          { id: "Si I1", label: "Si I1" },
        ],
      },
    ],
  },
];

// Exported but empty initially — will be populated dynamically
export let shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "track-order",
    label: "Track Order",
    path: "/shop/account/orders",
  },
];

// Filter options with dynamic categories
export const filterOptions = {
  categories: [], // This will be populated with categories
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
  ],
};

// Sort options
export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

// Address form controls
export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];

// Fetch categories and update filters, forms, and menu
async function initializeForm() {
  const categories = await createCategoryOptions();

  // Update filter options
  filterOptions.categories = categories;
  // Update subcategory form category field
  SubcategoryElement.find(el => el.name === "category").options = categories;

  // Update addProduct form elements
  addProductFormElements[2].options = categories; // Category select

  // Update shoppingViewHeaderMenuItems with dynamic categories
  const dynamicCategoryMenuItems = categories.map(cat => ({
    id: cat.id.toLowerCase().replace(/\s+/g, '-'), // e.g., "Men's Wear" -> "men's-wear"
    label: cat.label,
    path: `/shop/${cat.label}`, // Customize this if needed
  }));

  shoppingViewHeaderMenuItems = [
    {
      id: "home",
      label: "HOME",
      path: "/shop/home",
    },
    {
      id: "products",
      label: "PRODUCT",
      path: "/shop/listing",
    },
    ...dynamicCategoryMenuItems,
  ];
}

// Initialize the filter options with categories
async function initializeFilters() {
  const categories = await createCategoryOptions();
  filterOptions.categories = categories;
}

// Call the initialization function
initializeFilters().catch(console.error);

initializeForm(); // Call to initialize everything
