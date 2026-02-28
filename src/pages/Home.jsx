import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShopContext } from '../context/ShopContext'
import { FaShoppingBag, FaStore, FaArrowRight, FaStar, FaTruck, FaShieldAlt, FaHeadset, FaCreditCard, FaHeart } from 'react-icons/fa'
import { MdLocalOffer, MdTrendingUp, MdFlashOn, MdKeyboardArrowRight } from 'react-icons/md'
import ProductItem from '../components/ProductItem'
import axios from '../config/axios'


const Home = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useShopContext()
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/product/list');
        let products = response.data.products || [];
        products = products.filter(p => p.approvalStatus === 'approved');
        
        // Set featured products (first 8)
        setFeaturedProducts(products.slice(0, 8));
        
        // Group products by category
        const grouped = {};
        products.forEach(product => {
          const category = product.category || 'Other';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(product);
        });
        
        // Limit each category to 6 products
        Object.keys(grouped).forEach(category => {
          grouped[category] = grouped[category].slice(0, 6);
        });
        
        setProductsByCategory(grouped);
      } catch (error) {
        setFeaturedProducts([]);
        setProductsByCategory({});
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    {
      name: "Phones & Tablets",
      image: 'https://images.pexels.com/photos/1054397/pexels-photo-1054397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Electronics',
      color: 'bg-blue-50',
      icon: '📱'
    },
    {
      name: "Fashion",
      image: 'https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Fashion',
      color: 'bg-pink-50',
      icon: '👗'
    },
    {
      name: "Home & Office",
      image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Home%20%26%20Office',
      color: 'bg-green-50',
      icon: '🏠'
    },
    {
      name: "Computing",
      image: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Computing',
      color: 'bg-purple-50',
      icon: '💻'
    },
    {
      name: "Electronics",
      image: 'https://images.pexels.com/photos/1054397/pexels-photo-1054397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Electronics',
      color: 'bg-yellow-50',
      icon: '🔌'
    },
    {
      name: "Sporting Goods",
      image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Sports',
      color: 'bg-red-50',
      icon: '⚽'
    },
    {
      name: "Automotive",
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Automotive',
      color: 'bg-gray-50',
      icon: '🚗'
    },
    {
      name: "Beauty & Health",
      image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/collection?category=Beauty',
      color: 'bg-rose-50',
      icon: '💄'
    }
  ];

  const deals = [
    {
      title: "Flash Sales",
      subtitle: "Up to 70% Off",
      image: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      link: "/collection?sale=flash"
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh Products",
      image: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      link: "/collection?sort=newest"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Image Carousel */}
      <div className="bg-white relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="relative overflow-hidden rounded-lg">
            {/* Image Carousel */}
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1 - Main Promotional Banner */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Left Content */}
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          GBOGO <span className="text-yellow-400">Deals</span> of the Month
                        </h1>
                        <div className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          December
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-xs font-bold">₦</span>
                        </div>
                        <span className="text-white">Pay on Delivery</span>
                      </div>
                      
                      <p className="text-sm text-purple-100 mb-6">
                        **T&Cs Apply | Ends 31st December**
                      </p>
                      
                      <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        SHOP NOW
                      </button>
                    </div>

                    {/* Right Content - Featured Products */}
                    <div className="lg:w-1/2 bg-gradient-to-r from-purple-700 to-purple-800 p-6 flex items-center">
                      <div className="grid grid-cols-1 gap-4 w-full">
                        {/* Featured Product 1 */}
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm">Smartphone Pro Max</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-600">₦89,999</span>
                              <span className="text-sm text-gray-500 line-through">₦120,000</span>
                            </div>
                          </div>
                        </div>

                        {/* Featured Product 2 */}
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">💻</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm">Laptop Ultra</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-600">₦299,999</span>
                              <span className="text-sm text-gray-500 line-through">₦350,000</span>
                            </div>
                          </div>
                        </div>

                        {/* Featured Product 3 */}
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎧</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm">Wireless Headphones</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-600">₦15,999</span>
                              <span className="text-sm text-gray-500 line-through">₦25,000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 - Flash Sales */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          Flash <span className="text-yellow-300">Sales</span>
                        </h1>
                        <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          Up to 70% Off
                        </div>
                      </div>
                      <p className="text-lg mb-6">Limited time offers on top brands</p>
                      <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        SHOP NOW
                      </button>
                    </div>
                    <div className="lg:w-1/2 bg-gradient-to-r from-red-600 to-red-700 p-6 flex items-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">👕</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Fashion</h4>
                          <span className="text-lg font-bold text-red-600">-50%</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">📱</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Electronics</h4>
                          <span className="text-lg font-bold text-red-600">-30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 - New Arrivals */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          New <span className="text-yellow-300">Arrivals</span>
                        </h1>
                        <div className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          Fresh Products
                        </div>
                      </div>
                      <p className="text-lg mb-6">Discover the latest trends</p>
                      <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        EXPLORE
                      </button>
                    </div>
                    <div className="lg:w-1/2 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">🏠</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Home & Office</h4>
                          <span className="text-lg font-bold text-blue-600">New</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">💄</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Beauty</h4>
                          <span className="text-lg font-bold text-blue-600">Trending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 - Fashion Week */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          Fashion <span className="text-yellow-300">Week</span>
                        </h1>
                        <div className="bg-white text-pink-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          Up to 60% Off
                        </div>
                      </div>
                      <p className="text-lg mb-6">Trendy styles for every occasion</p>
                      <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        SHOP FASHION
                      </button>
                    </div>
                    <div className="lg:w-1/2 bg-gradient-to-r from-purple-700 to-purple-800 p-6 flex items-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">👗</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Women's Fashion</h4>
                          <span className="text-lg font-bold text-pink-600">-60%</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">👔</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Men's Fashion</h4>
                          <span className="text-lg font-bold text-pink-600">-45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 5 - Tech Deals */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          Tech <span className="text-yellow-300">Deals</span>
                        </h1>
                        <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          Up to 40% Off
                        </div>
                      </div>
                      <p className="text-lg mb-6">Latest gadgets at amazing prices</p>
                      <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        SHOP TECH
                      </button>
                    </div>
                    <div className="lg:w-1/2 bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 flex items-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">💻</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Laptops</h4>
                          <span className="text-lg font-bold text-blue-600">-40%</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">📱</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Smartphones</h4>
                          <span className="text-lg font-bold text-blue-600">-35%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 6 - Home & Living */}
              <div className="flex-shrink-0 w-full">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg overflow-hidden relative h-80">
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 text-white flex flex-col justify-center">
                      <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                          Home & <span className="text-yellow-300">Living</span>
                        </h1>
                        <div className="bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                          Up to 55% Off
                        </div>
                      </div>
                      <p className="text-lg mb-6">Transform your living space</p>
                      <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                        SHOP HOME
                      </button>
                    </div>
                    <div className="lg:w-1/2 bg-gradient-to-r from-teal-700 to-teal-800 p-6 flex items-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">🛋️</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Furniture</h4>
                          <span className="text-lg font-bold text-emerald-600">-55%</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl">🏠</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">Decor</h4>
                          <span className="text-lg font-bold text-emerald-600">-45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-white opacity-100 scale-110' 
                      : 'bg-white opacity-50 hover:opacity-75'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide(currentSlide === 0 ? 5 : currentSlide - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide(currentSlide === 5 ? 0 : currentSlide + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Text Section - Below Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Welcome to <span className="text-purple-600">GBOGO</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your trusted marketplace for quality products. Shop smart, live better.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/collection')}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 shadow-sm transition-all duration-200 font-semibold text-lg flex items-center gap-3 group"
              >
                <FaShoppingBag className="text-xl group-hover:scale-110 transition-transform" />
                Start Shopping
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login?type=seller')}
                className="bg-white text-gray-800 border-2 border-gray-300 px-8 py-4 rounded-lg hover:bg-gray-50 hover:border-purple-600 shadow-sm transition-all duration-200 font-semibold text-lg flex items-center gap-3 group"
              >
                <FaStore className="text-xl group-hover:scale-110 transition-transform" />
                Start Selling
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaTruck className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Free Delivery</h3>
              <p className="text-gray-600 text-sm">On orders above ₦50,000</p>
            </div>
            <div className="text-center group">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="text-2xl text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Secure Payment</h3>
              <p className="text-gray-600 text-sm">100% secure payment</p>
            </div>
            <div className="text-center group">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaHeadset className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Dedicated support</p>
            </div>
            <div className="text-center group">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaCreditCard className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Easy Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Dashboard Section (for sellers only) */}
      {isAuthenticated && user?.role === 'seller' && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center">
                  <FaStore className="text-2xl text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Seller Dashboard</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg text-gray-800">Quick Actions</h3>
                  <div className="space-y-3">
                  <button
                    onClick={() => navigate('/add-product')}
                      className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Add New Product
                  </button>
                  <button
                    onClick={() => navigate('/seller/dashboard')}
                      className="w-full bg-white text-purple-600 border border-purple-500 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg text-gray-800">Recent Orders</h3>
                  <p className="text-green-600">No recent orders</p>
              </div>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg text-gray-800">Statistics</h3>
                <div className="space-y-2">
                    <p className="text-blue-600">Total Products: 0</p>
                    <p className="text-blue-600">Total Sales: ₦0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            <button 
              onClick={() => navigate('/collection')}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              View All Categories
              <MdKeyboardArrowRight className="text-xl" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <div
                key={category.name}
                className="group cursor-pointer"
                onClick={() => navigate(category.link)}
              >
                <div className={`relative overflow-hidden rounded-lg shadow-sm border border-gray-200 group-hover:shadow-md transition-all duration-300 ${category.color}`}>
                  <div className="aspect-square relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                    <div className="absolute top-3 left-3 text-2xl filter drop-shadow-lg">{category.icon}</div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Now Section */}
      <div className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Trending Now</h2>
            <button 
              onClick={() => navigate('/collection?sort=trending')}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              View All Trending
              <MdKeyboardArrowRight className="text-xl" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl cursor-pointer group hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <MdTrendingUp className="text-4xl text-blue-200" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hot Deals</h3>
              <p className="text-blue-100 mb-4">Discover the most popular products everyone is buying</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Explore Now
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl cursor-pointer group hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <MdFlashOn className="text-4xl text-green-200" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flash Sales</h3>
              <p className="text-green-100 mb-4">Limited time offers with massive discounts</p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl cursor-pointer group hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <FaStar className="text-4xl text-purple-200" />
              </div>
              <h3 className="text-xl font-bold mb-2">New Arrivals</h3>
              <p className="text-purple-100 mb-4">Fresh products just added to our collection</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Discover
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Deals & Offers</h2>
            <button 
              onClick={() => navigate('/collection')}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              View All Deals
              <MdKeyboardArrowRight className="text-xl" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deals.map((deal, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl shadow-sm border border-gray-200 cursor-pointer group bg-white"
                onClick={() => navigate(deal.link)}
              >
                <div className="aspect-video relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-8 text-white flex flex-col justify-center">
                    <div className="mb-2">
                      <MdFlashOn className="text-3xl text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
                    <p className="text-xl font-semibold mb-4 text-yellow-400">{deal.subtitle}</p>
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 w-fit">
                      Shop Now →
                    </button>
                  </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

                  {/* Products by Category Sections - Jumia Style */}
      {Object.keys(productsByCategory).length > 0 ? (
        Object.entries(productsByCategory).map(([category, products]) => (
          <div key={category} className="bg-white py-12 border-b border-gray-100">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                <button 
                  onClick={() => navigate(`/collection?category=${encodeURIComponent(category)}`)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                >
                  View All {category}
                  <MdKeyboardArrowRight className="text-xl" />
                </button>
              </div>
              
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {products.map(product => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                      <div className="relative aspect-square">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 left-2">
                          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            -20%
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">₦{product.price?.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 line-through">₦{(product.price * 1.25)?.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {product.sellerName || 'GBOGO Store'}
                        </div>
                        <button 
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
            ))}
          </div>
        )}
      </div>
          </div>
        ))
      ) : (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
            <button
              onClick={() => navigate('/collection')}
              className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with GBOGO
              </h2>
            <p className="text-lg text-gray-300 mb-8">
              Get exclusive access to new products, special offers, and insider deals
            </p>
            <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-500"
              />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Subscribe
              </button>
            </form>
            <p className="text-gray-400 text-sm mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose GBOGO?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaStar className="text-2xl text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800">Quality Assured</h4>
                <p className="text-gray-600">All products are verified and quality-checked</p>
              </div>
              <div className="text-center group">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MdTrendingUp className="text-2xl text-green-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800">Best Prices</h4>
                <p className="text-gray-600">Competitive prices and regular discounts</p>
              </div>
              <div className="text-center group">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MdLocalOffer className="text-2xl text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800">Exclusive Deals</h4>
                <p className="text-gray-600">Special offers and flash sales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home
