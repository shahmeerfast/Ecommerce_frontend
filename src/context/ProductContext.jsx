import React, { createContext, useState, useContext } from 'react';

const ProductContext = createContext();

export const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);

  const addProduct = async (productData) => {
    // API call to add product
    // Product status will be 'pending' by default
  };

  const approveProduct = async (productId) => {
    // API call to approve product
  };

  const rejectProduct = async (productId) => {
    // API call to reject product
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        pendingProducts, 
        addProduct, 
        approveProduct, 
        rejectProduct 
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext); 