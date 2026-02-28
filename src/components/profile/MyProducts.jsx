import React, { useState } from 'react'
import { useShopContext } from '../../context/ShopContext'
import { toast } from 'react-toastify'

const MyProducts = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null
  })
  const { addProduct } = useShopContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addProduct(productData)
      toast.success('Product added successfully!')
      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null
      })
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Product Name</label>
          <input 
            type="text"
            value={productData.name}
            onChange={(e) => setProductData({...productData, name: e.target.value})}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={productData.description}
            onChange={(e) => setProductData({...productData, description: e.target.value})}
            className="w-full border p-2 rounded"
            required
            rows="4"
          />
        </div>
        <div>
          <label className="block mb-1">Price</label>
          <input 
            type="number"
            value={productData.price}
            onChange={(e) => setProductData({...productData, price: e.target.value})}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select
            value={productData.category}
            onChange={(e) => setProductData({...productData, category: e.target.value})}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Product Image</label>
          <input 
            type="file"
            onChange={(e) => setProductData({...productData, image: e.target.files[0]})}
            className="w-full border p-2 rounded"
            accept="image/*"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Product
        </button>
      </div>
    </form>
  )
}

export default MyProducts 