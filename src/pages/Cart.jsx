import React from 'react';
import { useShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';

const CartItem = ({ item, currency, updateCartItemCount, removeFromCart }) => {
    const { backendUrl } = useShopContext();
    // Using a data URI for the placeholder image
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNjEgNzdINzkiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';

    // Construct the full image URL or use imported image
    const getImageUrl = (image) => {
        if (!image) return defaultImage;
        
        // If image is an imported module (local image)
        if (typeof image === 'object' && image.default) {
            return image.default;
        }
        
        // If image is already a complete URL
        if (image.startsWith('http') || image.startsWith('data:')) {
            return image;
        }

        // If image is a string but not a complete URL, assume it's a path relative to backend
        return `${backendUrl}/${image.replace(/^\//, '')}`;
    };

    // Get the first available image
    const getFirstImage = (item) => {
        // Try both images and image arrays
        const images = item.images || item.image || [];
        if (!images || !Array.isArray(images) || images.length === 0) {
            return defaultImage;
        }
        return getImageUrl(images[0]);
    };

    return (
        <div className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
            <div className='flex items-start gap-6'>
                <div className='w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 flex items-center justify-center overflow-hidden'>
                    <img 
                        className='w-full h-full object-cover' 
                        src={getFirstImage(item)}
                        alt={item.name} 
                        onError={(e) => {
                            console.log('Image load error for:', item.name, e);
                            e.target.src = defaultImage;
                            e.target.onerror = null;
                        }}
                    />
                </div>
                <div>
                    <p className='text-xs sm:text-lg font-medium'>{item.name || 'Unnamed Product'}</p>
                    <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{item.price || 0}</p>
                        {item.size && <p className='text-sm text-gray-500'>Size: {item.size}</p>}
                    </div>
                </div>
            </div>
            <input 
                type="number" 
                min={1} 
                value={item.quantity}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                        updateCartItemCount(value, item._id);
                    }
                }}
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
            />
            <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700"
            >
                Remove
            </button>
        </div>
    );
};

const Cart = () => {
    const { 
        currency, 
        getCartProducts, 
        removeFromCart,
        updateCartItemCount,
        navigate,
        isAuthenticated 
    } = useShopContext();

    const cartProducts = getCartProducts();

    if (!isAuthenticated) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">Please login to view your cart</h2>
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                >
                    Login
                </button>
            </div>
        );
    }

    if (!cartProducts || cartProducts.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
                <button 
                    onClick={() => navigate('/collection')}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className='border-t pt-14'>
            <div className='text-2xl mb-3'>
                <Title text1={'YOUR'} text2={'CART'} />
            </div>

            <div>
                {cartProducts.map((item) => (
                    <CartItem
                        key={item._id}
                        item={item}
                        currency={currency}
                        updateCartItemCount={updateCartItemCount}
                        removeFromCart={removeFromCart}
                    />
                ))}
            </div>

            <div className='flex justify-end my-20'>
                <div className='w-full sm:w-[450px]'>
                    <CartTotal />
                    <div className='w-full text-end'>
                        <button 
                            onClick={() => navigate('/place-order')} 
                            className='bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800'
                        >
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
