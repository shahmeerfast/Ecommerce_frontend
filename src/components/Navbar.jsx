import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useShopContext } from '../context/ShopContext'
import Notifications from './Notifications'
import mylogo from '../assets/mylogo.png';

const Navbar = () => {

    const [visible,setVisible] = useState(false);

    const {setShowSearch , getCartCount , navigate, token, setToken, setCartItems, user} = useContext(ShopContext);
    const { user: shopUser, logout: contextLogout, isAuthenticated, unreadMessagesCount } = useShopContext();

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
    }

  return (
    <div className='flex items-center justify-between py-5 font-medium relative z-40'>
      
      <Link to='/'><img src={mylogo} className='w-20' alt="Logo" /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        
        <NavLink to='/' className='flex flex-col items-center gap-1'>
            <p>HOME</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
            <p>COLLECTION</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
            <p>ABOUT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
            <p>CONTACT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/messages" className="nav-link relative">
          MESSAGES
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadMessagesCount}</span>
          )}
        </NavLink>
        {shopUser && (
          <Link 
            to="/profile" 
            className="flex flex-col items-center gap-1"
          >
            PROFILE
          </Link>
        )}
        {shopUser && shopUser.role === 'seller' && (
          <NavLink to="/seller/dashboard" className="flex flex-col items-center gap-1">
            SELLER DASHBOARD
          </NavLink>
        )}
        {shopUser && shopUser.role === 'admin' && (
          <NavLink to="/admin/dashboard" className="flex flex-col items-center gap-1">
            ADMIN DASHBOARD
          </NavLink>
        )}

      </ul>

      <div className='flex items-center gap-6'>
            {shopUser && <Notifications />}
            <img onClick={()=> { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
            
            <div className='group relative'>
                <img onClick={()=> token ? null : navigate('/login') } className='w-5 cursor-pointer' src={assets.profile_icon} alt="" />
                {/* Dropdown Menu */}
                {token && 
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-white text-gray-500 rounded shadow-lg border border-gray-200'>
                        <p className='cursor-pointer hover:text-black'>My Profile</p>
                        <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                        <p onClick={handleLogout} className='cursor-pointer hover:text-black'>Logout</p>
                    </div>
                </div>}
            </div> 
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </Link> 
            <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" /> 
      </div>

        {/* Sidebar menu for small screens */}
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
        </div>

    </div>
  )
}

export default Navbar
