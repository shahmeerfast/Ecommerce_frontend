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
        {/* Add similar input fields for other product details */}
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          Add Product
        </button>
      </div>
    </form>
  )
}

export default MyProducts