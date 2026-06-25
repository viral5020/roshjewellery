// Local cart management functions
const LOCAL_CART_KEY = 'localCart';

export const getLocalCart = () => {
  const cart = localStorage.getItem(LOCAL_CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const addToLocalCart = async (product) => {
  try {
    // Fetch product details from the server
    const response = await fetch(`/api/shop/products/get/${product.productId}`);
    const data = await response.json();
    const productDetails = data.data;

    const cart = getLocalCart();
    const existingItem = cart.find(item => item.productId === product.productId);
    
    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      // Add product with its details
      cart.push({
        productId: product.productId,
        quantity: product.quantity,
        title: productDetails.title,
        price: productDetails.price,
        salePrice: productDetails.salePrice,
        image: productDetails.image,
        weight: productDetails.weight,
        totalStock: productDetails.totalStock
      });
    }
    
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error adding to local cart:', error);
    return getLocalCart();
  }
};

export const updateLocalCartQuantity = (productId, quantity) => {
  const cart = getLocalCart();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    item.quantity = quantity;
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  }
  
  return cart;
};

export const removeFromLocalCart = (productId) => {
  const cart = getLocalCart();
  const updatedCart = cart.filter(item => item.productId !== productId);
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearLocalCart = () => {
  localStorage.removeItem(LOCAL_CART_KEY);
  return [];
}; 