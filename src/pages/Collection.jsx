import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { useProduct } from '../context/ProductContext';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const Collection = () => {
  const { search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { products: productContextProducts } = useProduct();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: { Men: false, Women: false, kids: false },
    types: { Topwear: false, Bottomwear: false, Winterwear: false },
  });

  const getLevelRank = (level) => {
    if (level === 'premium') return 3;
    if (level === 'trusted') return 2;
    if (level === 'new') return 1;
    return 0;
  };

  const applyFilter = () => {
    let productsCopy = allProducts.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    fpCopy.sort((a, b) => getLevelRank(b.seller?.level) - getLevelRank(a.seller?.level));

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
      applyFilter();
  }, [category, subCategory, search, showSearch, allProducts]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const categories = [
    'All',
    'Clothing',
    'Farm Products',
    'Home & Garden',
    'Electronics',
    'Books',
    'Vehicle',
    'Sports & Outdoors',
  ];

  const categoryMap = {
    'All': '',
    'Clothing': 'clothing',
    'Farm Products': 'farm',
    'Home & Garden': 'home',
    'Electronics': 'electronics',
    'Books': 'books',
    'Vehicle': 'vehicle',
    'Sports & Outdoors': 'sports',
    'Men': 'men',
    'Women': 'women',
    'Kids': 'kids',
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from backend...');
      setLoading(true);
      const response = await axios.get('/api/product/list');
      console.log('Fetched products:', response.data.products);
      let filteredProducts = response.data.products || [];
      filteredProducts = filteredProducts.filter(product => product.approvalStatus === 'approved');

      if (selectedCategory !== 'All') {
        const backendCategory = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          (product.category || '').toLowerCase().trim() === backendCategory
        );
      }

      if (selectedCategory === 'Clothing') {
        filteredProducts = filteredProducts.filter(product => 
          ['Men', 'Women', 'Kids', 'Topwear', 'Bottomwear', 'Winterwear'].includes(product.category) ||
          ['Men', 'Women', 'Kids', 'Topwear', 'Bottomwear', 'Winterwear'].includes(product.subCategory)
        );
      }

      const activeCategories = Object.entries(filters.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const activeTypes = Object.entries(filters.types)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      if (activeCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          activeCategories.some(cat => 
            (product.category || '').toLowerCase() === cat.toLowerCase() ||
            (product.subCategory || '').toLowerCase() === cat.toLowerCase()
          )
        );
      }

      if (activeTypes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          activeTypes.some(type => 
            (product.type || '').toLowerCase() === type.toLowerCase() ||
            (product.subCategory || '').toLowerCase() === type.toLowerCase()
          )
        );
      }

      switch (sortType) {
        case 'low-high':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'high-low':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }

      setAllProducts(filteredProducts);
      setFilterProducts(filteredProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, filters, sortType]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setFilters({
      categories: { Men: false, Women: false, kids: false },
      types: { Topwear: false, Bottomwear: false, Winterwear: false },
    });
  };

  const handleFilterChange = (section, key) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt='' />
        </p>
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Men', 'Women', 'kids'].map(key => (
              <p className='flex gap-2' key={key}>
                <input className='w-3' type='checkbox' checked={filters.categories[key]} onChange={() => handleFilterChange('categories', key)} /> {key}
            </p>
            ))}
          </div>
        </div>
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Topwear', 'Bottomwear', 'Winterwear'].map(key => (
              <p className='flex gap-2' key={key}>
                <input className='w-3' type='checkbox' checked={filters.types[key]} onChange={() => handleFilterChange('types', key)} /> {key}
            </p>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1='ALL' text2='COLLECTIONS' />
          <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
            <option value='relavent'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
            <option value='newest'>Sort by: Newest First</option>
            </select>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl font-bold mb-4'>Categories</h2>
          <div className='flex flex-wrap gap-2'>
            {categories.map(category => (
              <button key={category} onClick={() => handleCategoryClick(category)} className={`px-4 py-2 rounded-md ${selectedCategory === category ? 'bg-black text-white' : 'bg-gray-200'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {loading ? (
            <div className='text-center py-8'>Loading...</div>
          ) : filterProducts.length === 0 ? (
            <div className='text-center py-8'>No products found</div>
          ) : (
            filterProducts.map(item => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.images}
                name={item.name}
                price={item.price}
                sellerLevel={item.seller?.level}
                sellerName={item.seller?.fullName || item.seller?.name || item.seller?.email}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
