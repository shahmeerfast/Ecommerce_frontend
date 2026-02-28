import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const AddProduct = () => {
    const navigate = useNavigate();
    const { addProduct, token, user } = useShopContext();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        subCategory: '',
        condition: 'new',
        image: null,
        imagePreview: null
    });

    // Hardcoded categories
    const hardcodedCategories = [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'sports', label: 'Sports & Outdoors' },
        { value: 'farm', label: 'Farm Products' },
        { value: 'vehicle', label: 'Vehicle' },
    ];
    const [categories, setCategories] = useState(hardcodedCategories);
    const [backendCategoryMap, setBackendCategoryMap] = useState({});

    // Category to subcategory mapping
    const categorySubcategories = {
        electronics: ['Smartphones', 'Laptops', 'Accessories', 'Gaming', 'Audio'],
        clothing: ['Men', 'Women', 'Kids', 'Accessories', 'Shoes'],
        books: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Magazines'],
        home: ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Lighting'],
        sports: ['Equipment', 'Clothing', 'Shoes', 'Accessories', 'Outdoor'],
        farm: ['Vegetables', 'Fruits', 'Grains', 'Livestock', 'Other'],
        vehicle: ['Car', 'Bike', 'Truck', 'Bus', 'Other']
    };

    // Check authentication on component mount
    useEffect(() => {
        if (!token || !user || user.role !== 'seller') {
            toast.error('Please login as a seller to add products');
            navigate('/login?type=seller');
        }
        // Fetch categories from backend and merge with hardcoded
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/category/all', { headers: { token } });
                const backendCategories = (res.data.categories || res.data || []);
                // Map for quick lookup of backend subcategories
                const backendMap = {};
                backendCategories.forEach(cat => {
                    backendMap[cat.name.toLowerCase()] = cat.subcategories || [];
                });
                setBackendCategoryMap(backendMap);
                // Merge categories for dropdown
                const backendDropdown = backendCategories.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }));
                const merged = [...hardcodedCategories];
                backendDropdown.forEach(cat => {
                    if (!merged.some(hc => hc.value === cat.value)) merged.push(cat);
                });
                setCategories(merged);
            } catch (err) {
                // fallback: just use hardcoded
            }
        };
        fetchCategories();
    }, [token, user, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'image' && files.length > 0) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        } else if (name === 'category') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subCategory: '' // Reset subcategory when category changes
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!token || !user || user.role !== 'seller') {
                toast.error('Please login as a seller to add products');
                navigate('/login?type=seller');
                return;
            }

            if (!formData.name || !formData.price || !formData.description || !formData.category || !formData.subCategory) {
                toast.error('Please fill in all required fields');
                return;
            }

            if (!formData.image) {
                toast.error('Please upload a product image');
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subCategory', formData.subCategory);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('sizes', JSON.stringify(['S', 'M', 'L']));
            
            if (formData.image) {
                formDataToSend.append('images', formData.image);
            }

            const response = await addProduct(formDataToSend);
            
            if (response.success) {
                toast.success('Product added successfully');
                navigate('/seller/dashboard');
            }

        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.response?.data?.message || error.message || 'Error adding product');
        }
    };

    // Subcategory options logic
    let subcategoryOptions = [];
    if (formData.category) {
        const hardcoded = categorySubcategories[formData.category] || [];
        const backend = backendCategoryMap[formData.category] || [];
        // Merge and dedupe
        const all = [...hardcoded, ...backend];
        subcategoryOptions = [...new Set(all.map(s => s.trim()).filter(Boolean))];
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Single Image Upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Product Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {formData.imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={formData.imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-64 w-64 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            <span>Upload a file</span>
                                            <input
                                                type="file"
                                                name="image"
                                                className="sr-only"
                                                onChange={handleChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Price (₦)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Condition
                    </label>
                    <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    >
                        <option value="new">New</option>
                        <option value="uk_used">UK Used</option>
                        <option value="used">Used</option>
                        <option value="used_neat">Used but still very neat</option>
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Category
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                {/* Subcategory */}
                {formData.category && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Subcategory
                        </label>
                        <select
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        >
                            <option value="">Select a subcategory</option>
                            {subcategoryOptions.map((subCat) => (
                                <option key={subCat} value={subCat.toLowerCase()}>
                                    {subCat}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        required
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/seller/dashboard')}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;